<script setup>
/**
 * Vendor
 */
import { ref, reactive, watch, computed, onMounted, onUnmounted } from "vue"
import { useMeta } from "vue-meta"
import { DateTime } from "luxon"
import { useRouter } from "vue-router"
import cloneDeep from "lodash.clonedeep"

/**
 * UI
 */
import Breadcrumbs from "@ui/Breadcrumbs.vue"
import Button from "@ui/Button.vue"
import Banner from "@ui/Banner.vue"
import Pagination from "@ui/Pagination.vue"
import { Dropdown, DropdownItem, DropdownTitle, DropdownDivider } from "@ui/Dropdown"

/**
 * Local
 */
import EventChart from "./EventChart.vue"
import EventGeneralCard from "./EventGeneralCard.vue"
import EventPriceCard from "./EventPriceCard.vue"
import EventAnalyticsCard from "./EventAnalyticsCard.vue"
import EventPoolCard from "./EventPoolCard.vue"
import EventPersonalStats from "./EventPersonalStats.vue"

import BetCard from "@modules/events/BetCard.vue"
import DepositCard from "@modules/events/DepositCard.vue"

/**
 * Modals
 */
import ParticipantsModal from "@local/modals/ParticipantsModal.vue"
import LiquidityModal from "@local/modals/position/LiquidityModal.vue"
import StakeModal from "@local/modals/position/StakeModal.vue"
import ConfirmTransactionModal from "@local/modals/ConfirmTransactionModal.vue"
import EventDetailsModal from "@local/modals/EventDetailsModal.vue"
import NotifyMeModal from "@local/modals/NotifyMeModal.vue"

/**
 * Composable
 */
import { useCountdown } from "@/composable/date"
import { useMarket } from "@/composable/market"

/**
 * API
 */
import { fetchEventById, fetchEventParticipants } from "@/api/events"

/**
 * Services
 */
import { numberWithSymbol } from "@utils/amounts"
import { capitalizeFirstLetter, toClipboard } from "@utils/misc"
import { juster, analytics, currentNetwork } from "@sdk"
import { supportedMarkets, verifiedMakers } from "@config"

/**
 * Store
 */
import { useMarketStore } from "@store/market"
import { useAccountStore } from "@store/account"
import { useNotificationsStore } from "@store/notifications"
import { useApplicationCacheStore } from "@store/cache"

/**
 * gql
 */
import { event as eventModel } from "@/graphql/models"

/** Meta */
const meta = useMeta({
	title: `Event`,
	description: "Available markets for events, for providing liquidity and accepting stakes from users",
})

const marketStore = useMarketStore()
const accountStore = useAccountStore()
const notificationsStore = useNotificationsStore()
const cacheStore = useApplicationCacheStore()

const { updateWithdrawals } = useMarket()

const router = useRouter()

const breadcrumbs = reactive([
	{
		name: "All events",
		path: "/events",
	},
])

/**
 * Modals
 */
const showBetModal = ref(false)
const showLiquidityModal = ref(false)
const showConfirmTransactionModal = ref(false)
const showParticipantsModal = ref(false)
const showEventDetailsModal = ref(false)
const showNotifyMeModal = ref(false)

/**
 * Filters
 */
const filters = reactive({
	bets: "all",
	liquidity: "all",
})
const handleSelectFilter = ({ target, value }) => {
	filters[target] = value
}

/**
 * Local Event
 */
const event = ref(null)
const getEvent = async () => {
	if (event.value) return

	const { id: eventId } = router.currentRoute.value.params
	event.value = await fetchEventById({ id: eventId })

	/** meta */
	meta.meta.title = `Price Event - ${supportedMarkets[event.value.currencyPair.symbol].target} (#${numberWithSymbol(
		event.value.id,
		",",
	)})`

	if (!event.value) {
		router.push("/events")
	} else {
		/** breadcrumbs */
		breadcrumbs.push({
			name: `Event #${numberWithSymbol(event.value.id, ",")}`,
			path: `/events/${event.value.id}`,
		})
	}
}

const hasWonBet = computed(() => {
	if (!event.value) return

	return !!event.value.bets.filter((bet) => bet.userId == accountStore.pkh).filter((bet) => bet.side == event.value.winnerBets).length
})
const positionForWithdraw = computed(() => {
	return accountStore.wonPositions.find((position) => position.event.id == event.value.id)
})

/** Countdown setup: Time to start */
const startDt = computed(() => new Date(event.value?.betsCloseTime).getTime())
const {
	countdownText: startCountdownText,
	status: startStatus,
	stop: destroyStartCountdown,
	start: startStartCountdown,
} = useCountdown(startDt)

/** Countdown setup: Time to finish */
const finishDt = computed(() =>
	DateTime.fromISO(event.value?.betsCloseTime).plus({ second: event.value?.measurePeriod }).toJSDate().getTime(),
)
const {
	countdownText: finishCountdownText,
	status: finishStatus,
	time: finishTime,
	stop: destroyFinishCountdown,
	start: startFinishCountdown,
} = useCountdown(finishDt)

const price = computed(() => {
	return {
		rate: marketStore.markets[event.value?.currencyPair.symbol]?.quotes[0]?.price,
		integer: numberWithSymbol(marketStore.markets[event.value?.currencyPair.symbol]?.quotes[0]?.price.toString().split(".")[0], ","),
		fraction: marketStore.markets[event.value?.currencyPair.symbol]?.quotes[0]?.price.toString().split(".")[1],
	}
})

const participants = ref(0)

/**
 * Liquidity (Deposits) & Bets
 */
const filteredDeposits = computed(() => {
	if (!event.value) return []

	if (filters.liquidity == "all") {
		return event.value.deposits
	} else {
		return event.value.deposits.filter((deposit) => deposit.userId == accountStore.pkh)
	}
})
const filteredBets = computed(() => {
	if (!event.value) return []

	if (filters.bets == "all") {
		return event.value.bets
	} else {
		return event.value.bets.filter((bet) => bet.userId == accountStore.pkh)
	}
})

/** for personal stats */
const userDeposits = computed(() => event.value.deposits.filter((deposit) => deposit.userId == accountStore.pkh))
const userBets = computed(() => event.value.bets.filter((bet) => bet.userId == accountStore.pkh))

const wonText = computed(() => {
	if (userBets.value.every((bet) => bet.side == event.value.winnerBets)) {
		return "All of your stakes won were in the winning direction"
	} else if (userBets.value.some((bet) => bet.side == event.value.winnerBets)) {
		return "One or more (not all) of your stakes were in the winning direction"
	} else {
		return ""
	}
})

const selectedPageForDeposits = ref(1)
const paginatedDeposits = computed(() =>
	cloneDeep(filteredDeposits.value)
		.sort((a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime())
		.slice((selectedPageForDeposits.value - 1) * 3, selectedPageForDeposits.value * 3),
)

const selectedPageForBets = ref(1)
const paginatedBets = computed(() =>
	cloneDeep(filteredBets.value)
		.sort((a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime())
		.slice((selectedPageForBets.value - 1) * 3, selectedPageForBets.value * 3),
)

const pendingBet = ref(null)

const handleJoin = (target) => {
	/** disable Bet / Liquidity right after betsCloseTime */
	if (startStatus.value == "Finished" || event.value.totalLiquidityProvided == 0) return

	analytics.log("showBetModal", { where: "event_base" })

	cacheStore.submissions.side = target

	showBetModal.value = true
}

const handleBet = (bet) => {
	pendingBet.value = bet
	showBetModal.value = false
}

const handleLiquidity = () => {
	if (event.value.status !== "NEW" || !accountStore.isLoggined) return

	showLiquidityModal.value = true

	analytics.log("showLiquidityModal", { where: "event_base" })
}

const handleContinue = () => {
	showBetModal.value = false
	showConfirmTransactionModal.value = true
}
const handleCancelTransaction = () => {
	showConfirmTransactionModal.value = false
	showBetModal.value = true
}
const handleConfirmTransaction = () => {
	showConfirmTransactionModal.value = false
	showBetModal.value = true

	cacheStore.submissions.isTransactionConfirmed = true
}

const handleBetModalClose = () => {
	showBetModal.value = false
}

const isWithdrawing = ref(false)
const handleWithdraw = () => {
	isWithdrawing.value = true

	analytics.log("clickWithdraw", { where: "event_base" })

	juster.sdk
		.withdraw(event.value.id, accountStore.pkh)
		.then((op) => {
			/** Pending transaction label */
			accountStore.pendingTransaction.awaiting = true

			op.confirmation()
				.then((result) => {
					accountStore.pendingTransaction.awaiting = false
					isWithdrawing.value = false

					/** rm won position from store */
					accountStore.positionsForWithdrawal = accountStore.positionsForWithdrawal.filter(
						(position) => position.event.id != event.value.id,
					)

					updateWithdrawals()

					if (!result.completed) {
						// todo: handle it?
					}
				})
				.catch(() => {
					accountStore.pendingTransaction.awaiting = false
					isWithdrawing.value = false
				})

			notificationsStore.create({
				notification: {
					type: "success",
					title: "Withdrawal request sent",
					description: "Processing takes about 10-30 seconds. Funds will appear in your wallet soon",
					autoDestroy: true,
				},
			})

			analytics.log("onWithdraw", {
				eventId: event.value.id,
			})
		})
		.catch(() => {
			isWithdrawing.value = false
		})
}

const handleParticipants = () => {
	showParticipantsModal.value = true

	analytics.log("showParticipantsModal", { where: "event_base" })
}

const copy = (target) => {
	if (target == "id") {
		notificationsStore.create({
			notification: {
				icon: "copy",
				title: "Event ID copied to clipboard",
				autoDestroy: true,
				badges: [
					{
						secondaryText: "ID: ",
						tertiaryText: event.value.id,
						icon: "hash",
					},
				],
			},
		})

		toClipboard(event.value.id)
	}
	if (target == "url") {
		notificationsStore.create({
			notification: {
				icon: "copy",
				title: "Event URL copied to clipboard",
				autoDestroy: true,
				badges: [
					{
						secondaryText: `app.juster.fi${location.pathname}`,
						icon: "copy",
					},
				],

				actions: [
					{
						name: "Open in new tab",
						callback: () => window.open(location, "_blank"),
					},
				],
			},
		})

		toClipboard(location)
	}
}

watch(event, async () => {
	await getEvent()

	/** Manage Favicon */
	const favicon = document.getElementById("favicon")
	const isDark = window.matchMedia("(prefers-color-scheme: dark)")
	const baseFavicon = `/favicon_${isDark.matches ? "dark" : "light"}`

	switch (event.value.status) {
		case "NEW":
			favicon.href = `${baseFavicon}__new.svg`
			break
		case "STARTED":
			favicon.href = `${baseFavicon}__running.svg`
			break
		case "FINISHED":
			favicon.href = `${baseFavicon}__finished.svg`
			break
	}
})

const subToEvent = ref({})

const userPosition = ref([])
const subToDeposits = ref({})

onMounted(async () => {
	await getEvent()

	startStartCountdown()
	startFinishCountdown()

	/** Subscribe to event, TODO: refactor */
	subToEvent.value = await juster.gql
		.subscription({
			event: [
				{
					where: { id: { _eq: event.value.id } },
				},
				{
					...eventModel,
				},
			],
		})
		.subscribe({
			next: (data) => {
				const { event: newEvent } = data

				/** Clear pending bet on update */
				if (event.value.bets.length !== newEvent[0].bets.length) {
					pendingBet.value = null
				}

				event.value = newEvent[0]
			},
			error: console.error,
		})

	/** Subscribe to deposits */
	subToDeposits.value = await juster.gql
		.subscription({
			position: [
				{
					where: {
						eventId: { _eq: event.value.id },
						userId: { _eq: accountStore.pkh },
					},
				},
				{
					id: true,
					withdrawn: true,
					liquidityProvidedAboveEq: true,
					liquidityProvidedBelow: true,
					value: true,
					userId: true,
				},
			],
		})
		.subscribe({
			next: ({ position }) => {
				userPosition.value = position[0]
			},
			error: console.error,
		})

	/** Participants */
	const eventParticipants = await fetchEventParticipants({
		id: event.value.id,
	})
	participants.value = eventParticipants.length
})

onUnmounted(() => {
	if (Object.prototype.hasOwnProperty.call(subToEvent.value, "_state") && !subToEvent.value?.closed) {
		subToEvent.value.unsubscribe()
	}
	if (Object.prototype.hasOwnProperty.call(subToDeposits.value, "_state") && !subToDeposits.value?.closed) {
		subToDeposits.value.unsubscribe()
	}

	/** Reset Favicon */
	const favicon = document.getElementById("favicon")
	const isDark = window.matchMedia("(prefers-color-scheme: dark)")

	if (isDark.matches) favicon.href = "/favicon_dark.svg"
	else favicon.href = "/favicon_light.svg"

	destroyStartCountdown()
	destroyFinishCountdown()
})
</script>

<template>
	<div :class="$style.wrapper">
		<metainfo>
			<template #title="{ content }"> {{ content }} • Juster </template>
		</metainfo>

		<StakeModal :show="showBetModal" :event="event" @onBet="handleBet" @onContinue="handleContinue" @onClose="handleBetModalClose" />
		<LiquidityModal v-if="event" :show="showLiquidityModal" :event="event" @onClose="showLiquidityModal = false" />
		<ConfirmTransactionModal
			:show="showConfirmTransactionModal"
			@onCancel="handleCancelTransaction"
			@onConfirm="handleConfirmTransaction"
			@onClose="showConfirmTransactionModal = false"
		/>
		<ParticipantsModal v-if="event" :show="showParticipantsModal" :event="event" @onClose="showParticipantsModal = false" />
		<EventDetailsModal v-if="event" :show="showEventDetailsModal" :event="event" @onClose="showEventDetailsModal = false" />
		<NotifyMeModal :show="showNotifyMeModal" @onClose="showNotifyMeModal = false" />

		<Breadcrumbs :crumbs="breadcrumbs" :class="$style.breadcrumbs" />

		<Transition name="slide">
			<div v-if="event" :class="$style.container">
				<Flex v-if="event" direction="column" gap="24" :class="$style.side">
					<EventGeneralCard
						:event="event"
						:start-status="startStatus"
						:finish-status="finishStatus"
						:start-countdown="startCountdownText"
						:finish-countdown="finishCountdownText"
						:price="price"
						:is-won="hasWonBet"
						:position-for-withdraw="positionForWithdraw"
						:is-withdrawing="isWithdrawing"
						@openParticipants="handleParticipants"
						@onBet="handleJoin"
						@onWithdraw="handleWithdraw"
					/>

					<EventPriceCard v-if="event.status !== 'CANCELED'" :event="event" :price="price" :finish-time="finishTime" />

					<EventPoolCard :event="event" @onLiquidity="handleLiquidity" />

					<EventAnalyticsCard :event="event" />

					<div :class="$style.event_footer">
						<div :class="$style.metadata">
							<span
								>Price Event —
								{{ supportedMarkets[event.currencyPair.symbol].target }}
								(#{{ numberWithSymbol(event.id, ",") }})

								<Icon
									v-if="verifiedMakers[currentNetwork].includes(event.creatorId)"
									name="verified"
									size="13"
									color="green"
							/></span>

							<Flex v-if="verifiedMakers[currentNetwork].includes(event.creatorId)" align="center" gap="8">
								<Flex align="center" gap="4">
									<Text size="12" weight="600" color="tertiary"> Recurring </Text>
								</Flex>
								<Text size="11" weight="500" color="support"> ✦ </Text>
								<Text size="12" weight="600" color="tertiary"> Initial Liquidity Included </Text>
							</Flex>
							<Flex v-else align="center" gap="8">
								<Flex align="center" gap="4">
									<Icon name="warning" size="12" color="yellow" />
									<Text size="12" weight="600" color="tertiary"> Custom </Text>
								</Flex>
								<Text size="11" weight="500" color="support"> ✦ </Text>
								<Text size="12" weight="600" color="tertiary"> Unknown state of Liquidity </Text>
							</Flex>
						</div>

						<Dropdown side="top">
							<template #trigger>
								<Button type="secondary" size="small"><Icon name="dots" size="12" /> More</Button>
							</template>

							<template #dropdown>
								<!-- <DropdownItem @click="showNotifyMeModal = true">
									<Icon name="notifications" size="16" />
									Notify Me
								</DropdownItem> -->
								<DropdownItem @click="handleLiquidity" :disabled="!accountStore.isLoggined">
									<Icon name="liquidity" size="16" />
									Direct Deposit
								</DropdownItem>

								<DropdownDivider />

								<!-- <DropdownTitle>Customization</DropdownTitle>
								<DropdownItem @click="handleSwitch('mainnet')">
									<Icon name="collection" size="16" />
									Presets
								</DropdownItem>

								<DropdownItem @click="handleSwitch('testnet')">
									<Icon name="settings" size="16" />
									View Options
								</DropdownItem>

								<DropdownItem @click="handleSwitch('testnet')">
									<Icon name="layers" size="16" />
									Configure Blocks
								</DropdownItem>

								<DropdownDivider /> -->

								<DropdownItem @click="copy('id')">
									<Icon name="copy" size="16" />
									Copy ID
								</DropdownItem>

								<DropdownItem @click="copy('url')">
									<Icon name="copy" size="16" />
									Copy URL
								</DropdownItem>

								<DropdownDivider />

								<DropdownTitle>Other</DropdownTitle>

								<DropdownItem @click="showEventDetailsModal = true">
									<Icon name="menu" size="16" />
									View all params
								</DropdownItem>
							</template>
						</Dropdown>
					</div>
				</Flex>

				<Flex direction="column" gap="40" :class="$style.base">
					<EventChart v-if="event" :event="event" />

					<Flex direction="column" gap="24" v-if="accountStore.pkh">
						<Flex direction="column" gap="8">
							<Text size="16" weight="600" color="primary"> My Statistics </Text>
							<Text size="14" weight="500" color="tertiary"> Aggregated data for all your positions </Text>
						</Flex>

						<Flex direction="column" gap="8">
							<Banner v-if="hasWonBet" icon="checkcircle" color="green">
								{{ wonText }}
							</Banner>

							<EventPersonalStats
								:event="event"
								:position="userPosition"
								:user-deposits="userDeposits"
								:user-bets="userBets"
							/>
						</Flex>
					</Flex>

					<Flex direction="column" gap="24">
						<Flex justify="between">
							<Flex direction="column" gap="8">
								<Text size="16" weight="600" color="primary"> Stakes </Text>
								<Text size="14" weight="500" color="tertiary"> All stakes from users for this event </Text>
							</Flex>

							<div :class="$style.filters">
								<div
									@click="
										handleSelectFilter({
											target: 'bets',
											value: 'all',
										})
									"
									:class="[$style.filter, filters.bets == 'all' && $style.active]"
								>
									All
								</div>
								<span>/</span>
								<div
									@click="
										handleSelectFilter({
											target: 'bets',
											value: 'my',
										})
									"
									:class="[$style.filter, filters.bets == 'my' && $style.active]"
								>
									Only me
								</div>
							</div>
						</Flex>

						<Flex v-if="pendingBet || filteredBets.length" direction="column" gap="8">
							<Flex v-if="filteredBets.length" align="center" :class="$style.columns">
								<Text size="12" color="support" weight="700" :class="$style.column">TYPE</Text>
								<Text size="12" color="support" weight="700" :class="$style.column">SIDE</Text>
								<Text size="12" color="support" weight="700" :class="$style.column">AMOUNT</Text>
								<Text size="12" color="support" weight="700" :class="$style.column">
									{{
										(event.status == "CANCELED" && "REFUND") ||
										(["NEW", "STARTED"].includes(event.status) && "POTENTIAL") ||
										(event.status == "FINISHED" && "PROFIT")
									}}
								</Text>
							</Flex>
							<Flex direction="column" gap="8">
								<BetCard v-if="pendingBet" :bet="pendingBet" :event="event" pending />
								<BetCard v-for="bet in paginatedBets" :event="event" :key="bet.id" :bet="bet" />
							</Flex>
						</Flex>

						<Banner v-else icon="help" color="gray">{{
							filters.bets == "all"
								? `Still no stakes for this event, maybe yours will be the first?`
								: `If you have placed a stake, but it is not in this list yet — please wait for the transaction confirmation`
						}}</Banner>

						<Pagination
							v-if="filteredBets.length > 3"
							v-model="selectedPageForBets"
							:total="filteredBets.length"
							:limit="3"
							:class="$style.pagination"
						/>
					</Flex>

					<Flex direction="column" gap="24">
						<Flex justify="between">
							<Flex direction="column" gap="8">
								<Text size="16" weight="600" color="primary"> Liquidity </Text>
								<Text size="14" weight="500" color="tertiary"> Provided to maintain this event </Text>
							</Flex>

							<div :class="$style.filters">
								<div
									@click="
										handleSelectFilter({
											target: 'liquidity',
											value: 'all',
										})
									"
									:class="[$style.filter, filters.liquidity == 'all' && $style.active]"
								>
									All
								</div>
								<span>/</span>
								<div
									@click="
										handleSelectFilter({
											target: 'liquidity',
											value: 'my',
										})
									"
									:class="[$style.filter, filters.liquidity == 'my' && $style.active]"
								>
									Only me
								</div>
							</div>
						</Flex>

						<Flex v-if="filteredDeposits.length" direction="column" gap="8">
							<Flex align="center" :class="$style.columns">
								<Text size="12" weight="700" color="support" :class="$style.column">TYPE </Text>
								<Text size="12" weight="700" color="support" :class="$style.column">RISE</Text>
								<Text size="12" weight="700" color="support" :class="$style.column">FALL</Text>

								<Text size="12" weight="700" color="support" :class="$style.column">RETURN</Text>
							</Flex>
							<Flex v-if="filteredDeposits.length" direction="column" gap="8">
								<DepositCard v-for="deposit in paginatedDeposits" :key="deposit.id" :deposit="deposit" :event="event" />
							</Flex>
						</Flex>

						<Banner v-else icon="help" color="gray">{{
							filters.liquidity == "all"
								? `This event has not yet received initial liquidity, please wait for a few minutes`
								: `If you have provided liquidity, but it is not reflected in this list yet — please wait for the transaction confirmation`
						}}</Banner>

						<Pagination
							v-if="filteredDeposits.length > 3"
							v-model="selectedPageForDeposits"
							:total="filteredDeposits.length"
							:limit="3"
							:class="$style.pagination"
						/>
					</Flex>
				</Flex>
			</div>
		</Transition>
	</div>
</template>

<style module>
.wrapper {
}

.breadcrumbs {
	margin-bottom: 24px;
}

.container {
	display: flex;
	gap: 40px;
}

.base {
	flex: 1;
}

.side {
	min-width: 450px;
	max-width: 450px;
	height: fit-content;
}

.columns {
	padding: 0 16px;
}

.column:nth-child(1) {
	flex: 2;
}

.column:nth-child(2) {
	flex: 1;
}

.column:nth-child(3) {
	flex: 1;
}

.column:nth-child(4) {
	flex: 1;
}

.details_btn {
	margin: 8px 0 32px 0;
}

.filters {
	/* position: absolute;
	top: 0;
	right: 0; */

	width: max-content;
	display: flex;
	align-items: center;
	gap: 12px;

	border-radius: 6px;
	background: var(--btn-secondary-bg);
	height: 32px;
	padding: 0 12px;
}

.filters span {
	font-size: 14px;
	font-weight: 700;
	color: var(--text-tertiary);

	opacity: 0.5;
}

.filter {
	display: flex;
	align-items: center;
	gap: 6px;

	cursor: pointer;

	font-size: 13px;
	font-weight: 600;
	color: var(--text-tertiary);
	fill: var(--text-tertiary);
	white-space: nowrap;

	transition: all 0.2s ease;
}

.filter:hover {
	fill: var(--text-primary);
	color: var(--text-primary);
}

.filter.active {
	fill: var(--blue);
	color: var(--text-primary);
}

.pagination {
	margin-top: 16px;
}

.event_footer {
	display: flex;
	justify-content: space-between;

	margin-top: 16px;
	margin-bottom: 32px;
}

.metadata {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.metadata span:nth-child(1) {
	font-size: 13px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-secondary);
	fill: var(--text-secondary);

	display: flex;
	gap: 4px;
}

.metadata span:nth-child(2) {
	font-size: 12px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-tertiary);
}

@media (max-width: 940px) {
	.container {
		flex-direction: column;
		gap: 40px;
	}

	.side {
		max-width: initial;
		min-width: initial;
	}
}

@media (max-width: 650px) {
	.columns {
		display: none;
	}
}
</style>
