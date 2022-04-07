<script setup>
import { ref, reactive, watch, computed, onMounted, onUnmounted } from "vue"
import { useMeta } from "vue-meta"
import { DateTime } from "luxon"
import { useRouter } from "vue-router"
import { cloneDeep } from "lodash"

/**
 * UI
 */
import Breadcrumbs from "@/components/ui/Breadcrumbs"
import Button from "@/components/ui/Button"
import Banner from "@/components/ui/Banner"
import Pagination from "@/components/ui/Pagination"

/**
 * Local
 */
import EventChart from "./EventChart"
import EventGeneralCard from "./EventGeneralCard"
import EventPriceCard from "./EventPriceCard"
import EventPoolCard from "./EventPoolCard"
import EventPersonalStats from "./EventPersonalStats"

import BetCard from "@/components/modules/events/BetCard"
import DepositCard from "@/components/modules/events/DepositCard"

import ParticipantsModal from "@/components/local/modals/ParticipantsModal"
import LiquidityModal from "@/components/local/modals/position/LiquidityModal"
import BetModal from "@/components/local/modals/position/BetModal"
import EventDetailsModal from "@/components/local/modals/EventDetailsModal"

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
import { numberWithSymbol } from "@/services/utils/amounts"
import { capitalizeFirstLetter } from "@/services/utils/global"
import { juster, analytics } from "@/services/sdk"

/**
 * Store
 */
import { useMarketStore } from "@/store/market"
import { useAccountStore } from "@/store/account"
import { useNotificationsStore } from "@/store/notifications"
const marketStore = useMarketStore()
const accountStore = useAccountStore()
const notificationsStore = useNotificationsStore()

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
const showParticipantsModal = ref(false)
const showEventDetailsModal = ref(false)

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

	if (!event.value) {
		router.push("/events")
	} else {
		/** breadcrumbs */
		breadcrumbs.push({
			name: `Event #${event.value.id}`,
			path: `/events/${event.value.id}`,
		})
	}
}

const hasWonBet = computed(() => {
	if (!event.value) return

	return !!event.value.bets
		.filter((bet) => bet.userId == accountStore.pkh)
		.filter((bet) => bet.side == event.value.winnerBets).length
})
const positionForWithdraw = computed(() => {
	return accountStore.wonPositions.find(
		(position) => position.event.id == event.value.id,
	)
})

/** Countdown setup: Time to start */
const startDt = computed(() => new Date(event.value?.betsCloseTime).getTime())
const {
	countdownText: startCountdownText,
	status: startStatus,
	stop: destroyStartCountdown,
} = useCountdown(startDt)

/** Countdown setup: Time to finish */
const finishDt = computed(() =>
	DateTime.fromISO(event.value?.betsCloseTime)
		.plus({ second: event.value?.measurePeriod })
		.toJSDate()
		.getTime(),
)
const {
	countdownText: finishCountdownText,
	status: finishStatus,
	time: finishTime,
	stop: destroyFinishCountdown,
} = useCountdown(finishDt)

const price = computed(() => {
	return {
		rate: marketStore.markets[event.value?.currencyPair.symbol]?.quotes[0]
			?.price,
		integer: numberWithSymbol(
			marketStore.markets[
				event.value?.currencyPair.symbol
			]?.quotes[0]?.price
				.toString()
				.split(".")[0],
			",",
		),
		fraction: marketStore.markets[
			event.value?.currencyPair.symbol
		]?.quotes[0]?.price
			.toString()
			.split(".")[1],
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
		return event.value.deposits.filter(
			(deposit) => deposit.userId == accountStore.pkh,
		)
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
const userDeposits = computed(() =>
	event.value.deposits.filter(
		(deposit) => deposit.userId == accountStore.pkh,
	),
)
const userBets = computed(() =>
	event.value.bets.filter((bet) => bet.userId == accountStore.pkh),
)

const wonText = computed(() => {
	if (userBets.value.every((bet) => bet.side == event.value.winnerBets)) {
		return "All of your bets won were in the winning direction"
	} else if (
		userBets.value.some((bet) => bet.side == event.value.winnerBets)
	) {
		return "One or more (not all) of your bets were in the winning direction"
	}
})

const selectedPageForDeposits = ref(1)
const paginatedDeposits = computed(() =>
	cloneDeep(filteredDeposits.value)
		.sort(
			(a, b) =>
				new Date(b.createdTime).getTime() -
				new Date(a.createdTime).getTime(),
		)
		.slice(
			(selectedPageForDeposits.value - 1) * 3,
			selectedPageForDeposits.value * 3,
		),
)

const selectedPageForBets = ref(1)
const paginatedBets = computed(() =>
	cloneDeep(filteredBets.value)
		.sort(
			(a, b) =>
				new Date(b.createdTime).getTime() -
				new Date(a.createdTime).getTime(),
		)
		.slice(
			(selectedPageForBets.value - 1) * 3,
			selectedPageForBets.value * 3,
		),
)

const pendingBet = ref(null)

const preselectedSide = ref("Rise")
const handleJoin = (target) => {
	preselectedSide.value = capitalizeFirstLetter(target)

	/** disable Bet / Liquidity right after betsCloseTime */
	if (
		startStatus.value == "Finished" ||
		event.value.totalLiquidityProvided == 0
	)
		return

	analytics.log("showBetModal", { where: "event_base" })

	showBetModal.value = true
}

const handleBet = (bet) => {
	pendingBet.value = bet
	showBetModal.value = false
}

const handleLiquidity = () => {
	if (event.value.status !== "NEW") return

	showLiquidityModal.value = true

	analytics.log("showLiquidityModal", { where: "event_base" })
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
					accountStore.positionsForWithdrawal =
						accountStore.positionsForWithdrawal.filter(
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
					description:
						"Processing takes about 10-30 seconds. Funds will appear in your wallet soon",
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

watch(event, async () => {
	await getEvent()
})

const subToEvent = ref({})

const userPosition = ref([])
const subToDeposits = ref({})

onMounted(async () => {
	await getEvent()

	/** Subscribe to event, TODO: refactor */
	subToEvent.value = await juster.gql
		.subscription({
			event: [
				{
					where: { id: { _eq: event.value.id } },
				},
				{
					id: true,
					status: true,
					betsCloseTime: true,
					creatorId: true,
					poolAboveEq: true,
					poolBelow: true,
					totalBetsAmount: true,
					totalLiquidityProvided: true,
					totalLiquidityShares: true,
					totalValueLocked: true,
					liquidityPercent: true,
					measurePeriod: true,
					closedOracleTime: true,
					createdTime: true,
					startRate: true,
					closedRate: true,
					winnerBets: true,
					targetDynamics: true,
					currencyPair: {
						id: true,
						symbol: true,
					},
					bets: {
						id: true,
						side: true,
						reward: true,
						amount: true,
						createdTime: true,
						userId: true,
					},
					deposits: {
						amountAboveEq: true,
						amountBelow: true,
						eventId: true,
						id: true,
						userId: true,
						createdTime: true,
						shares: true,
					},
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
	if (
		subToEvent.value.hasOwnProperty("_state") &&
		!subToEvent.value?.closed
	) {
		subToEvent.value.unsubscribe()
	}
	if (
		subToDeposits.value.hasOwnProperty("_state") &&
		!subToDeposits.value?.closed
	) {
		subToDeposits.value.unsubscribe()
	}

	destroyStartCountdown()
	destroyFinishCountdown()
})

/** Meta */
const { meta } = useMeta({
	title: `Event`,
	description:
		"Available markets for events, for providing liquidity and accepting bets from users",
})
</script>

<template>
	<div :class="$style.wrapper">
		<metainfo>
			<template v-slot:title="{ content }"
				>{{ content }} • Juster</template
			>
		</metainfo>

		<BetModal
			v-if="event"
			:show="showBetModal"
			:event="event"
			:preselectedSide="preselectedSide"
			@onBet="handleBet"
			@onClose="showBetModal = false"
		/>
		<LiquidityModal
			v-if="event"
			:show="showLiquidityModal"
			:event="event"
			@onClose="showLiquidityModal = false"
		/>
		<ParticipantsModal
			v-if="event"
			:show="showParticipantsModal"
			:event="event"
			@onClose="showParticipantsModal = false"
		/>
		<EventDetailsModal
			v-if="event"
			:show="showEventDetailsModal"
			:event="event"
			@onClose="showEventDetailsModal = false"
		/>

		<Breadcrumbs :crumbs="breadcrumbs" :class="$style.breadcrumbs" />

		<div v-if="event" :class="$style.container">
			<div :class="$style.base">
				<EventChart v-if="event" :event="event" />

				<div v-if="accountStore.pkh" :class="$style.block">
					<div :class="$style.title">Personal stats</div>
					<div :class="$style.description">
						Aggregated data for all your positions for this event
					</div>

					<Banner
						v-if="hasWonBet"
						icon="checkcircle"
						color="green"
						:class="$style.banner"
						>{{ wonText }}</Banner
					>

					<EventPersonalStats
						:event="event"
						:position="userPosition"
						:userDeposits="userDeposits"
						:userBets="userBets"
					/>
				</div>

				<div :class="$style.block">
					<div :class="$style.title">Bets</div>
					<div :class="$style.description">
						All the bets placed for this event
					</div>

					<div :class="$style.filters">
						<div
							@click="
								handleSelectFilter({
									target: 'bets',
									value: 'all',
								})
							"
							:class="[
								$style.filter,
								filters.bets == 'all' && $style.active,
							]"
						>
							All bets
						</div>
						<div :class="$style.dot" />
						<div
							@click="
								handleSelectFilter({
									target: 'bets',
									value: 'my',
								})
							"
							:class="[
								$style.filter,
								filters.bets == 'my' && $style.active,
							]"
						>
							My bets
						</div>
					</div>

					<!-- todo: new component BetsTable -->
					<div v-if="filteredBets.length" :class="$style.columns">
						<div :class="$style.column">TYPE</div>
						<div :class="$style.column">SIDE</div>
						<div :class="$style.column">AMOUNT</div>
						<div :class="$style.column">
							{{
								(event.status == "CANCELED" && "REFUND") ||
								(["NEW", "STARTED"].includes(event.status) &&
									"POTENTIAL") ||
								(event.status == "FINISHED" && "PROFIT")
							}}
						</div>
					</div>

					<div
						v-if="pendingBet || filteredBets.length"
						:class="$style.bets"
					>
						<BetCard
							v-if="pendingBet"
							:bet="pendingBet"
							:event="event"
							pending
						/>
						<BetCard
							v-for="bet in paginatedBets"
							:event="event"
							:key="bet.id"
							:bet="bet"
						/>
					</div>

					<Banner v-else icon="help" color="gray">{{
						filters.bets == "all"
							? `Still no bets for this event, maybe yours will be the first?`
							: `If you have placed a bet, but it is not in this list yet — please wait for the transaction confirmation`
					}}</Banner>

					<Pagination
						v-if="filteredBets.length > 3"
						v-model="selectedPageForBets"
						:total="filteredBets.length"
						:limit="3"
						:class="$style.pagination"
					/>
				</div>

				<div :class="$style.block">
					<div :class="$style.title">Liquidity</div>
					<div :class="$style.description">
						All the liquidity provided for this event
					</div>

					<div :class="$style.filters">
						<div
							@click="
								handleSelectFilter({
									target: 'liquidity',
									value: 'all',
								})
							"
							:class="[
								$style.filter,
								filters.liquidity == 'all' && $style.active,
							]"
						>
							All liquidity
						</div>
						<div :class="$style.dot" />

						<div
							@click="
								handleSelectFilter({
									target: 'liquidity',
									value: 'my',
								})
							"
							:class="[
								$style.filter,
								filters.liquidity == 'my' && $style.active,
							]"
						>
							My liquidity
						</div>
					</div>

					<div v-if="filteredDeposits.length" :class="$style.columns">
						<div :class="$style.column">TYPE</div>
						<div :class="$style.column">RISE</div>
						<div :class="$style.column">FALL</div>

						<div :class="$style.column">RETURN</div>
					</div>
					<div v-if="filteredDeposits.length" :class="$style.bets">
						<DepositCard
							v-for="deposit in paginatedDeposits"
							:key="deposit.id"
							:deposit="deposit"
							:event="event"
						/>
					</div>

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
				</div>
			</div>

			<div v-if="event" :class="$style.side">
				<EventGeneralCard
					:event="event"
					:startStatus="startStatus"
					:finishStatus="finishStatus"
					:startCountdown="startCountdownText"
					:finishCountdown="finishCountdownText"
					:price="price"
					:isWon="hasWonBet"
					:positionForWithdraw="positionForWithdraw"
					:isWithdrawing="isWithdrawing"
					@openParticipants="handleParticipants"
					@onBet="handleJoin"
					@onWithdraw="handleWithdraw"
				/>

				<EventPriceCard
					v-if="event.status !== 'CANCELED'"
					:event="event"
					:price="price"
					:finishTime="finishTime"
				/>

				<EventPoolCard :event="event" @onLiquidity="handleLiquidity" />

				<Button
					@click="showEventDetailsModal = true"
					type="secondary"
					size="small"
					block
					:class="$style.details_btn"
					><Icon name="menu" size="12" />View event details</Button
				>
			</div>
		</div>
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
	gap: 32px;
}

.base {
	flex: 1;
}

.side {
	display: flex;
	flex-direction: column;
	gap: 8px;

	min-width: 384px;
	max-width: 384px;
}

.banner {
	margin-bottom: 16px;
}

.header_badge span {
	color: var(--text-tertiary);
}

.event {
	background: var(--card-bg);
	border-radius: 8px;
	border: 1px solid var(--border);
	padding: 20px 0 20px 0;
	flex: 1;

	margin-bottom: 8px;
}

.header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;

	padding: 0 20px;
}

.info {
	display: flex;
	flex-direction: column;
}

.name {
	display: flex;
	align-items: center;

	margin-bottom: 12px;
}

.symbol_image {
	position: relative;

	margin-right: 10px;
}

.symbol_image svg {
	position: absolute;
	top: -4px;
	right: -4px;

	background: var(--card-bg);
	border-radius: 50%;
}

.symbol_image svg.higher {
	fill: var(--green);
}

.symbol_image svg.lower {
	fill: var(--red);
	transform: rotate(180deg);
}

.symbol_image img {
	width: 24px;
	height: 24px;
	border-radius: 6px;
	opacity: 0.7;
}

.name span {
	color: var(--text-tertiary);

	margin-left: 6px;
}

.labels {
	display: flex;
	gap: 6px;
}

.divider {
	width: 100%;
	border: 1px solid var(--border);

	margin: 20px 0;
}

.actions {
	display: flex;
	align-items: center;
	gap: 6px;
}

.block {
	position: relative;

	margin-top: 40px;
}

.block .title {
	font-size: 17px;
	line-height: 1.2;
	font-weight: 500;
	color: var(--text-primary);

	margin-bottom: 8px;
}

.block .description {
	font-size: 12px;
	line-height: 1;
	font-weight: 500;
	color: var(--text-tertiary);

	margin-bottom: 24px;
}

.empty {
	display: flex;
	align-items: center;
	gap: 8px;

	font-size: 14px;
	line-height: 1.6;
	color: var(--text-tertiary);
	fill: var(--text-tertiary);
}

.columns {
	display: flex;
	align-items: center;

	padding: 0 16px;
	margin-bottom: 8px;
}

.column {
	display: flex;
	align-items: center;
	gap: 6px;

	font-size: 12px;
	line-height: 1;
	font-weight: 700;
	color: var(--text-tertiary);
	fill: var(--text-tertiary);
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

.bets {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.details_btn {
	margin-top: 8px;
}

.filters {
	position: absolute;
	top: 0;
	right: 0;

	width: max-content;
	display: flex;
	align-items: center;
	gap: 14px;

	border-radius: 6px;
	background: var(--btn-secondary-bg);
	height: 32px;
	padding: 0 12px;
}

.filters .dot {
	width: 4px;
	height: 4px;
	border-radius: 50%;
	background: var(--opacity-10);
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
</style>
