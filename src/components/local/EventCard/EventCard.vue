<script setup>
import {
	onMounted,
	onBeforeUnmount,
	onUnmounted,
	ref,
	reactive,
	computed,
	nextTick,
} from "vue"
import { DateTime } from "luxon"

/**
 * UI
 */
import { Dropdown, DropdownItem, DropdownDivider } from "@ui/Dropdown"
import Badge from "@ui/Badge.vue"
import Tooltip from "@ui/Tooltip.vue"

/**
 * Local
 */
import ParticipantsModal from "@local/modals/ParticipantsModal.vue"
import NotifyMeModal from "@local/modals/NotifyMeModal.vue"
import LiquidityModal from "@local/modals/position/LiquidityModal.vue"
import NewBetModal from "@local/modals/position/NewBetModal.vue"
import EventActions from "@local/EventActions.vue"

/**
 * Services
 */
import {
	toClipboard,
	getCurrencyIcon,
	capitalizeFirstLetter,
} from "@utils/misc"
import { juster, analytics, currentNetwork } from "@sdk"
import { abbreviateNumber } from "@utils/amounts"
import { supportedMarkets, verifiedMakers } from "@config"
import { toReadableDuration } from "@utils/date"

/**
 * Composable
 */
import { useCountdown } from "@/composable/date"
import { useMarket } from "@/composable/market"

/**
 * Store
 */
import { useMarketStore } from "@store/market"
import { useAccountStore } from "@store/account"
import { useNotificationsStore } from "@store/notifications"

// eslint-disable-next-line no-undef
const props = defineProps({
	event: { type: Object, default: () => {} },
	disableSub: { type: Boolean },
})

/** Stores */
const notificationsStore = useNotificationsStore()
const accountStore = useAccountStore()
const marketStore = useMarketStore()

const { updateWithdrawals } = useMarket()

const card = ref(null)
const openContextMenu = ref(false)

/** Bet modal */
const showBetModal = ref(false)

/** Modals */
const showLiquidityModal = ref(false)
const showParticipantsModal = ref(false)
const showNotifyMeModal = ref(false)

const subscription = ref({})

const symbol = computed(() => props.event.currencyPair.symbol)

const betModalCache = reactive({
	side: "Rise",
	amount: 0,
})

/** Countdown setup: Time to start */
const startDt = computed(() => new Date(props.event?.betsCloseTime).getTime())
const { status: startStatus, stop: destroyStartCountdown } =
	useCountdown(startDt)

/** Countdown setup: Time to finish */
const finishDt = computed(() =>
	DateTime.fromISO(props.event.betsCloseTime)
		.plus({ second: props.event.measurePeriod })
		.toJSDate()
		.getTime(),
)
const { stop: destroyFinishCountdown } = useCountdown(finishDt)

const timing = computed(() => {
	const eventDt = DateTime.fromISO(props.event.betsCloseTime).setLocale("ru")

	const endDt = eventDt.plus(props.event.measurePeriod * 1000)

	return {
		start: {
			time: eventDt.toLocaleString({
				hour: "numeric",
				minute: "numeric",
			}),
			day: eventDt.toLocaleString({
				day: "numeric",
			}),
			month: eventDt.toLocaleString({ month: "short" }),
		},
		end: {
			time: endDt.toLocaleString({
				hour: "numeric",
				minute: "numeric",
			}),
			day: endDt.toLocaleString({
				day: "numeric",
			}),
			month: endDt.toLocaleString({ month: "short" }),
		},
		showDay: eventDt.ordinal < endDt.ordinal,
	}
})

const liquidityLevel = computed(() => {
	if (props.event.totalLiquidityProvided >= 3000)
		return { text: "High", icon: "liquidity_high" }
	else if (props.event.totalLiquidityProvided >= 1000)
		return { text: "Medium", icon: "liquidity_medium" }
	else if (props.event.totalLiquidityProvided < 1000)
		return { text: "Low", icon: "liquidity_low" }
	else return { text: "Low", icon: "liquidity_low" }
})

const participants = computed(() => {
	let avatars = [
		...props.event.bets.map((bet) => bet.userId),
		...props.event.deposits.map((deposit) => deposit.userId),
	]

	/** remove duplicates */
	avatars = [...new Set(avatars)]

	return avatars
})

const userTVL = computed(() => {
	let tvl = 0

	tvl += props.event.deposits
		.filter((deposit) => deposit.userId == accountStore.pkh)
		.reduce((a, { amountBelow }) => a + amountBelow, 0)
	tvl += props.event.bets
		.filter((bet) => bet.userId == accountStore.pkh)
		.reduce((a, { amount }) => a + amount, 0)

	return tvl
})

/** Win & Withdraw */
const hasWonBet = computed(() => {
	if (!props.event) return

	return !!props.event.bets
		.filter((bet) => bet.userId == accountStore.pkh)
		.filter((bet) => bet.side == props.event.winnerBets).length
})
const positionForWithdraw = computed(() => {
	return accountStore.wonPositions.find(
		(position) => position.event.id == props.event.id,
	)
})

/** Join to the event & Liquidity */
const handleJoin = (target) => {
	betModalCache.side = capitalizeFirstLetter(target)

	/** disable Bet / Liquidity right after betsCloseTime */
	if (
		startStatus.value == "Finished" ||
		props.event.totalLiquidityProvided == 0
	)
		return

	analytics.log("showBetModal", { where: "event_card" })

	showBetModal.value = true
}

/** Withdraw */
const isWithdrawing = ref(false)
const handleWithdraw = () => {
	isWithdrawing.value = true

	analytics.log("clickWithdraw", { where: "event_card" })

	juster.sdk
		.withdraw(props.event.id, accountStore.pkh)
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
							(position) => position.event.id != props.event.id,
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
				eventId: props.event.id,
			})
		})
		.catch(() => {
			accountStore.pendingTransaction.awaiting = false
			isWithdrawing.value = false
		})
}

const handleParticipants = () => {
	showParticipantsModal.value = true

	analytics.log("showParticipantsModal", { where: "event_card" })
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
						tertiaryText: props.event.id,
						icon: "hash",
					},
				],
			},
		})

		toClipboard(props.event.id)
	}
	if (target == "url") {
		notificationsStore.create({
			notification: {
				icon: "copy",
				title: "Event URL copied to clipboard",
				autoDestroy: true,
				badges: [
					{
						secondaryText: `app.juster.fi/events/${props.event.id}`,
						icon: "copy",
					},
				],

				actions: [
					{
						name: "Open in new tab",
						callback: () =>
							window.open(
								`https://app.juster.fi/events/${props.event.id}`,
								"_blank",
							),
					},
				],
			},
		})

		toClipboard(`https://app.juster.fi/events/${props.event.id}`)
	}
}

/** Context menu */
const contextMenuStyles = reactive({
	top: 0,
	left: 0,
})
const contextMenuHandler = (e) => {
	e.preventDefault()

	analytics.log("showContextMenu")

	contextMenuStyles.top = `${e.layerY}px`
	contextMenuStyles.left = `${e.layerX}px`

	nextTick(() => {
		openContextMenu.value = !openContextMenu.value
	})
}

onMounted(async () => {
	if (card.value)
		card.value.addEventListener("contextmenu", contextMenuHandler)

	if (props.event.status === "FINISHED") return

	if (props.disableSub) return

	/** Subscription, TODO: refactor */
	subscription.value = await juster.gql
		.subscription({
			event: [
				{
					where: { id: { _eq: props.event.id } },
				},
				{
					id: true,
					poolAboveEq: true,
					poolBelow: true,
					totalLiquidityShares: true,
					totalValueLocked: true,
					totalLiquidityProvided: true,
					createdTime: true,
					creatorId: true,
					betsCloseTime: true,
					liquidityPercent: true,
					status: true,
					startRate: true,
					closedRate: true,
					winnerBets: true,
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

				marketStore.updEvent(newEvent[0])
			},
			error: console.error,
		})
})

onBeforeUnmount(() => {
	card.value.removeEventListener("contextmenu", contextMenuHandler)
})

onUnmounted(() => {
	if (
		Object.prototype.hasOwnProperty.call(subscription.value, "_state") &&
		!subscription.value?.closed
	) {
		subscription.value.unsubscribe()
	}

	destroyStartCountdown()
	destroyFinishCountdown()
})
</script>

<template>
	<router-link :to="`/events/${event.id}`" :class="$style.wrapper">
		<div ref="card">
			<NewBetModal
				:show="showBetModal"
				:event="event"
				:cache="betModalCache"
				@onBet="showBetModal = false"
				@onClose="showBetModal = false"
			/>
			<LiquidityModal
				:show="showLiquidityModal"
				:event="event"
				@onClose="showLiquidityModal = false"
			/>
			<ParticipantsModal
				:show="showParticipantsModal"
				@onClose="showParticipantsModal = false"
				:event="event"
			/>
			<NotifyMeModal
				:show="showNotifyMeModal"
				@onClose="showNotifyMeModal = false"
			/>

			<Dropdown
				:force-open="openContextMenu"
				@onClose="openContextMenu = false"
				:class="$style.dropdown"
				:style="{ ...contextMenuStyles }"
			>
				<template #dropdown>
					<DropdownItem @click.prevent="showNotifyMeModal = true">
						<Icon name="notifications" size="16" />Notify Me
					</DropdownItem>

					<DropdownItem @click.prevent="handleParticipants">
						<Icon name="users" size="16" />View participants
					</DropdownItem>

					<DropdownDivider />

					<DropdownItem @click.prevent="copy('id')">
						<Icon name="copy" size="16" />Copy ID
					</DropdownItem>
					<DropdownItem @click.prevent="copy('url')">
						<Icon name="copy" size="16" />Copy URL
					</DropdownItem>
				</template>
			</Dropdown>

			<div :class="$style.header">
				<div :class="$style.symbol_imgs">
					<img
						:src="getCurrencyIcon(symbol.split('-')[0])"
						alt="symbol"
					/>
					<img :src="getCurrencyIcon('USD')" alt="symbol" />
				</div>

				<div :class="$style.users">
					<Tooltip placement="bottom-end">
						<div :class="$style.participants">
							<img
								v-for="participantAddress in participants.slice(
									0,
									3,
								)"
								:key="participantAddress"
								:src="`https://services.tzkt.io/v1/avatars/${participantAddress}`"
								:class="[
									$style.user_avatar,
									$style.participant,
								]"
								alt="avatar"
							/>
							<div
								v-if="participants.length > 3"
								:class="[
									$style.participant,
									$style.more_participants,
								]"
							>
								+{{ participants.length - 3 }}
							</div>
						</div>

						<template #content
							>Participants ({{ participants.length }})</template
						>
					</Tooltip>

					<Tooltip placement="bottom-end">
						<div :class="$style.creator">
							<template
								v-if="
									verifiedMakers[currentNetwork].includes(
										event.creatorId,
									)
								"
							>
								<Icon name="logo_symbol" size="24" />
								<Icon
									name="verified"
									size="16"
									:class="$style.verified_icon"
								/>
							</template>

							<template v-else>
								<img
									:src="`https://services.tzkt.io/v1/avatars/${event.creatorId}`"
									:class="$style.user_avatar"
									alt="avatar"
								/>
							</template>
						</div>

						<template #content>{{
							verifiedMakers[currentNetwork].includes(
								event.creatorId,
							)
								? "Recurring event by Juster"
								: "Custom event from user"
						}}</template>
					</Tooltip>
				</div>
			</div>

			<div :class="$style.title">
				{{
					supportedMarkets[symbol] &&
					supportedMarkets[symbol].description
				}}
			</div>

			<div :class="$style.description">
				<span>
					<Icon
						name="price_event"
						size="12"
						:style="{
							fill:
								(event.winnerBets === 'ABOVE_EQ' &&
									'var(--green)') ||
								(event.winnerBets === 'BELOW' && 'var(--red)'),
							transform:
								event.winnerBets === 'BELOW' && 'scaleX(-1)',
						}"
					/>
					Price Event
				</span>

				<div :class="$style.dot" />

				<span v-if="event.status === 'NEW'">Open for stakes</span>
				<span v-else-if="event.status === 'STARTED'">
					Watching the price
				</span>
				<span v-else-if="event.status === 'FINISHED'">
					Price determined
				</span>
			</div>

			<div :class="$style.badges">
				<Tooltip
					v-if="startStatus == 'In progress' && event.status == 'NEW'"
					placement="bottom-start"
				>
					<Badge
						size="small"
						color="purple"
						:class="$style.main_badge"
					>
						<Icon name="event_new" size="12" />New
					</Badge>

					<template #content>
						The event is available for betting and providing
						liquidity
					</template>
				</Tooltip>
				<Tooltip
					v-else-if="
						startStatus == 'Finished' && event.status == 'NEW'
					"
					placement="bottom-start"
					text-align="left"
				>
					<Badge color="yellow" :class="$style.main_badge">
						<Icon name="event_new" size="12" />Starting
					</Badge>

					<template #content>
						Submissions is closed.<br />
						<span>The end of the event is pending</span>
					</template>
				</Tooltip>
				<Tooltip
					v-else-if="event.status == 'STARTED'"
					placement="bottom-start"
					text-align="left"
				>
					<Badge color="yellow" :class="$style.main_badge">
						<Icon name="event_active" size="12" />Running
					</Badge>
					<template #content>
						Submissions is closed.<br />
						<span>The end of the event is pending</span>
					</template>
				</Tooltip>
				<Tooltip
					v-else-if="event.status == 'FINISHED'"
					placement="bottom-start"
				>
					<Badge color="green" :class="$style.main_badge">
						<Icon name="event_finished" size="12" />Finished
					</Badge>
					<template #content
						>The event is closed, winning side determined</template
					>
				</Tooltip>
				<Tooltip
					v-else-if="event.status == 'CANCELED'"
					placement="bottom-start"
				>
					<Badge color="gray" :class="$style.main_badge">
						<Icon name="stop" size="12" />Canceled
					</Badge>
					<template #content
						>This event has been canceled, funds returned</template
					>
				</Tooltip>

				<!-- Duration Badge -->
				<Badge color="gray" :class="$style.badge">
					<Icon name="time" size="12" />

					{{ timing.start.time }}
					<span>{{
						toReadableDuration({
							seconds: event.measurePeriod,
							asObject: true,
						}).val
					}}</span>
					{{ timing.end.time }}
				</Badge>

				<!-- Custom Badge -->
				<Tooltip
					v-if="
						!verifiedMakers[currentNetwork].includes(
							event.creatorId,
						)
					"
					placement="bottom-start"
				>
					<Badge color="yellow" :class="$style.badge">
						<Icon name="bolt" size="12" /> Custom
					</Badge>

					<template #content>Custom event from user</template>
				</Tooltip>

				<!-- TVL Badge -->
				<Tooltip placement="bottom-end">
					<Badge v-if="userTVL" color="gray" :class="$style.badge">
						<img
							:src="`https://services.tzkt.io/v1/avatars/${accountStore.pkh}`"
							:class="$style.my_avatar"
							alt="avatar"
						/>
						{{ abbreviateNumber(userTVL) }} ꜩ
					</Badge>

					<template #content>My TVL: Bets + Liquidity</template>
				</Tooltip>
			</div>

			<div :class="$style.hints">
				<div
					v-if="startStatus == 'In progress'"
					:class="[$style.hint, $style.gray]"
				>
					<Icon name="time" size="14" />
					<div>
						Starting
						<span>
							{{
								DateTime.fromISO(event.betsCloseTime)
									.setLocale("en")
									.toRelative()
							}}
						</span>
					</div>
				</div>

				<div
					v-else-if="
						startStatus == 'Finished' && event.status == 'NEW'
					"
					:class="[$style.hint, $style.gray]"
				>
					<Icon name="time" size="14" />
					<div>Starting</div>
				</div>

				<div
					v-else-if="
						startStatus == 'Finished' && event.status == 'STARTED'
					"
					:class="[$style.hint, $style.yellow]"
				>
					<Icon name="time" size="14" />
					<div>
						Ending
						<span>
							{{
								DateTime.fromISO(event.betsCloseTime)
									.plus({ second: event.measurePeriod })
									.setLocale("en")
									.toRelative()
							}}
						</span>
					</div>
				</div>

				<div
					v-else-if="event.status == 'FINISHED'"
					:class="[$style.hint, $style.gray]"
				>
					<Icon name="time" size="14" />
					<div>
						Ended
						<span>
							{{
								DateTime.fromISO(event.betsCloseTime, {
									locale: "en",
								})
									.plus({ second: event.measurePeriod })
									.toRelative()
							}}
						</span>
					</div>
				</div>

				<div
					v-if="event.status == 'CANCELED'"
					:class="[$style.hint, $style.red]"
				>
					<Icon name="flag" size="14" />
					<div><span>Canceled</span> Measurement delay</div>
				</div>

				<Tooltip
					v-if="event.status !== 'FINISHED'"
					placement="top-start"
					text-align="left"
				>
					<div
						:class="[
							$style.hint,
							event.bets.length >= 3 && $style.green,
							event.bets.length >= 1 && $style.yellow,
							event.bets.length === 0 && $style.gray,
						]"
					>
						<Icon
							:name="
								(event.bets.length >= 3 && 'liquidity_high') ||
								(event.bets.length >= 1 &&
									'liquidity_medium') ||
								(event.bets.length === 0 && 'liquidity_low')
							"
							size="14"
						/>

						<div>
							<span>{{
								(event.bets.length >= 3 && "High") ||
								(event.bets.length >= 1 && "Medium") ||
								(event.bets.length === 0 && "Low")
							}}</span>
							Demand
						</div>
					</div>

					<template #content>
						<span>Stakes:</span>
						{{ event.bets.length }} <br />
						<span>Liquidity:</span>
						{{ event.totalLiquidityProvided }} XTZ
					</template>
				</Tooltip>

				<Tooltip
					v-if="event.winnerBets == 'BELOW'"
					placement="bottom-start"
				>
					<div :class="[$style.hint, $style.red]">
						<Icon name="arrow_circle_bottom_right" size="14" />
						<div><span>Fall</span> won</div>
					</div>

					<template #content
						><span>Difference =</span> <br />
						{{
							(
								event.closedRate * 100 -
								event.startRate * 100
							).toFixed(2)
						}}</template
					>
				</Tooltip>

				<Tooltip
					v-if="event.winnerBets == 'ABOVE_EQ'"
					placement="bottom-start"
				>
					<div :class="[$style.hint, $style.green]">
						<Icon name="arrow_circle_top_right" size="14" />
						<div><span>Rise</span> won</div>
					</div>

					<template #content
						><span>Difference =</span> <br />
						{{
							(
								event.closedRate * 100 -
								event.startRate * 100
							).toFixed(2)
						}}</template
					>
				</Tooltip>
			</div>

			<EventActions
				@onBet="handleJoin"
				@onWithdraw="handleWithdraw"
				:event="event"
				:is-won="hasWonBet"
				:position-for-withdraw="positionForWithdraw"
				:disabled="
					event.totalLiquidityProvided == 0 ||
					startStatus == 'Finished'
				"
				:is-withdrawing="isWithdrawing"
				:class="$style.bottom_actions"
			/>
		</div>
	</router-link>
</template>

<style module>
.wrapper {
	position: relative;
	max-width: 617px;

	background: var(--card-bg);
	border-radius: 8px;
	outline: 2px solid transparent;

	padding: 20px;

	transition: all 0.2s ease;
}

.wrapper:hover {
	outline: 2px solid var(--border);
}

.dropdown {
	position: absolute;
}

.header {
	display: flex;
	align-items: center;
	justify-content: space-between;

	height: 34px;

	margin-bottom: 20px;
}

.symbol_imgs {
	position: relative;

	width: 30px;
	height: 30px;
}

.symbol_imgs img {
	width: 20px;
	height: 20px;
	border-radius: 5px;
}

.symbol_imgs img:first-child {
	position: absolute;
	z-index: 1;
	outline: 3px solid var(--card-bg);
}

.symbol_imgs img:last-child {
	position: absolute;
	top: 10px;
	right: 0;
}

.users {
	display: flex;
	align-items: center;
	gap: 8px;
}

.participants {
	display: flex;
}

.participant {
	margin-left: -10px;
}

.creator {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;

	fill: var(--text-secondary);

	width: 30px;
	height: 30px;
}

.verified_icon {
	fill: var(--brand);
	background: var(--card-bg);
	border-radius: 50%;

	position: absolute;
	top: -4px;
	right: -4px;
	box-sizing: content-box;
}

.user_avatar {
	width: 34px;
	height: 34px;

	background: rgba(0, 0, 0, 0.15);
	border-radius: 50px;
	border: 3px solid var(--card-bg);

	padding: 2px;
}

.more_participants {
	width: 34px;
	height: 34px;

	display: flex;
	align-items: center;
	justify-content: center;

	font-size: 11px;
	line-height: 1.1;
	font-weight: 700;
	color: var(--text-blue);

	background: rgb(35, 35, 35);
	border-radius: 50px;
	border: 3px solid var(--card-bg);
}

.title {
	display: flex;
	align-items: center;

	height: 20px;

	font-size: 14px;
	font-weight: 600;
	line-height: 16px;
	color: var(--text-primary);

	margin-bottom: 8px;
}

.title img {
	display: flex;

	width: 16px;
	height: 16px;

	margin-right: 6px;
}

.title svg {
	display: flex;

	fill: var(--text-tertiary);

	margin-right: 6px;
}

.title span {
	color: var(--text-tertiary);

	margin-left: 4px;
}

.description {
	display: flex;
	align-items: center;
	gap: 8px;

	margin-bottom: 16px;
}

.description span {
	display: flex;
	gap: 4px;

	font-size: 12px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-tertiary);
	fill: var(--text-tertiary);
}

.description span img {
	width: 12px;
	height: 12px;
}

.dot {
	width: 4px;
	height: 4px;
	border-radius: 50%;
	background: var(--border);
}

.badges {
	display: flex;
	align-items: center;

	margin-bottom: 24px;
}

.main_badge {
	margin-right: 8px;
}

.badge {
	margin-right: 4px;
}

.hints {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.hint {
	display: flex;
	align-items: center;

	font-size: 12px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-tertiary);
}

.hint.red svg {
	fill: var(--red);
}

.hint.gray svg {
	fill: var(--text-tertiary);
}

.hint.yellow svg {
	fill: var(--yellow);
}

.hint.green svg {
	fill: var(--green);
}

.hint span {
	color: var(--text-secondary);
}

.hint svg {
	margin-right: 8px;
}

.hint.yellow {
	fill: var(--yellow);
}

.hint.green {
	fill: var(--green);
}

.hint.red {
	fill: var(--red);
}

.hint.gray {
	fill: var(--text-secondary);
}

.my_avatar {
	width: 16px;
	height: 16px;
}

.bottom_actions {
	margin-top: 24px;
}
</style>
