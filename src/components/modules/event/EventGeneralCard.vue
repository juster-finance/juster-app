<script setup>
/**
 * Vendor
 */
import { computed } from "vue"
import { DateTime } from "luxon"

/**
 * UI
 */
import Tooltip from "@ui/Tooltip.vue"

/**
 * Local
 */
import EventActions from "@local/EventActions.vue"

/**
 * Services
 */
import { numberWithSymbol } from "@utils/amounts"
import { pluralize } from "@utils/misc"
import { currentNetwork } from "@sdk"
import { toReadableDuration } from "@utils/date"
import { supportedMarkets, verifiedMakers } from "@config"

const props = defineProps({
	event: {
		type: Object,
		required: true,
	},
	startCountdown: {
		type: String,
	},
	finishCountdown: {
		type: String,
	},
	startStatus: {
		type: String,
		required: true,
	},
	finishStatus: {
		type: String,
		required: true,
	},
	price: {
		type: Object,
	},
	isWon: {
		type: Boolean,
	},
	positionForWithdraw: {
		type: Object,
	},
	isWithdrawing: {
		type: Boolean,
	},
})
const emit = defineEmits(["openParticipants", "onBet", "onWithdraw"])

const symbol = computed(() => props.event.currencyPair.symbol)

const participantsAvatars = computed(() => {
	let avatars = [
		...props.event.bets.map((bet) => bet.userId),
		...props.event.deposits.map((deposit) => deposit.userId),
	]

	/** remove duplicates */
	avatars = [...new Set(avatars)]

	return avatars
})

const timing = computed(() => {
	const eventDt = DateTime.fromISO(props.event.betsCloseTime).setLocale("en")

	const endDt = eventDt.plus(props.event.measurePeriod * 1000)

	return {
		start: {
			time: eventDt.toLocaleString({
				hour: "numeric",
				minute: "numeric",
			}),
			date: eventDt.toLocaleString({
				day: "numeric",
				month: "short",
			}),
			day: eventDt.toFormat("cccc"),
		},
		end: {
			time: endDt.toLocaleString({
				hour: "numeric",
				minute: "numeric",
			}),
			date: endDt.toLocaleString({
				day: "numeric",
				month: "short",
			}),
			day: endDt.toFormat("cccc"),
		},
		showDay: eventDt.ordinal < endDt.ordinal,
	}
})

const priceDynamics = computed(() => {
	const startRate = props.event.startRate * 100
	const closedRate = props.event.closedRate * 100

	const percent =
		props.event.status == "FINISHED"
			? (100 * Math.abs(closedRate - startRate)) /
			  ((closedRate + startRate) / 2)
			: (100 * Math.abs(props.price.rate - startRate)) /
			  ((props.price.rate + startRate) / 2)

	const diff =
		props.event.status == "FINISHED"
			? closedRate - startRate
			: props.price.rate - startRate

	return { diff, percent }
})

const endDiff = computed(() =>
	DateTime.fromISO(props.event.betsCloseTime)
		.plus({
			second: props.event.measurePeriod,
		})
		.diff(DateTime.fromISO(props.event.betsCloseTime), ["hours"])
		.toObject(),
)

const isHighdemand = computed(() => props.event.bets.length >= 4)
</script>

<template>
	<div :class="$style.wrapper">
		<div :class="$style.header">
			<div :class="$style.title">
				<Icon
					name="price_event"
					size="16"
					:style="{
						fill:
							(event.winnerBets === 'ABOVE_EQ' &&
								'var(--green)') ||
							(event.winnerBets === 'BELOW' && 'var(--red)'),
						transform: event.winnerBets === 'BELOW' && 'scaleX(-1)',
					}"
				/>
				{{
					supportedMarkets[symbol] && supportedMarkets[symbol].target
				}}
				<span>price event</span>
			</div>

			<div :class="$style.users">
				<Tooltip placement="top-end">
					<div
						@click="emit('openParticipants')"
						:class="$style.participants"
					>
						<img
							v-for="participantAvatar in participantsAvatars.slice(
								0,
								3,
							)"
							:key="participantAvatar"
							:src="`https://services.tzkt.io/v1/avatars/${participantAvatar}`"
							:class="[$style.user_avatar, $style.participant]"
							alt="avatar"
						/>
						<div
							v-if="participantsAvatars.length > 3"
							:class="[
								$style.participant,
								$style.more_participants,
							]"
						>
							<Icon name="dots" size="12" color="secondary" />
						</div>
					</div>

					<template #content
						>Participants
						<span
							>({{ participantsAvatars.length }})</span
						></template
					>
				</Tooltip>

				<Tooltip placement="top">
					<div :class="$style.creator">
						<template
							v-if="
								verifiedMakers[currentNetwork].includes(
									event.creatorId,
								)
							"
						>
							<Icon
								name="logo_symbol"
								size="24"
								color="primary"
							/>
							<Icon
								name="verified"
								size="16"
								color="green"
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

					<template #content>
						<template
							v-if="
								verifiedMakers[currentNetwork].includes(
									event.creatorId,
								)
							"
						>
							<Flex align="center" gap="6">
								<Icon
									name="repeat"
									size="14"
									color="secondary"
								/>
								Recurring event by Juster
							</Flex>
						</template>
						<template v-else> Custom event from user </template>
					</template>
				</Tooltip>
			</div>
		</div>

		<div :class="$style.card">
			<div :class="$style.card__header">
				<div
					:class="[
						$style.card__status,
						event.status == 'NEW' && $style.purple,
						event.status == 'STARTED' && $style.yellow,
						event.status == 'FINISHED' && $style.green,
						event.status == 'CANCELED' && $style.gray,
					]"
				>
					<template
						v-if="
							(startStatus == 'In progress') &
							(event.status == 'NEW')
						"
					>
						<Icon name="event_new" size="14" /> New
					</template>
					<template
						v-else-if="
							startStatus == 'Finished' && event.status == 'NEW'
						"
					>
						<Icon name="event_new" size="14" /> Starting
					</template>
					<template
						v-else-if="
							startStatus == 'Finished' &&
							event.status == 'STARTED'
						"
					>
						<Icon name="event_active" size="14" /> Running
					</template>
					<template
						v-else-if="
							startStatus == 'Finished' &&
							event.status == 'FINISHED'
						"
					>
						<Icon name="event_finished" size="14" /> Finished
					</template>
					<template v-else-if="event.status == 'CANCELED'">
						<Icon name="stop" size="14" /> Canceled
					</template>
				</div>

				<div :class="$style.card__duration">
					{{
						toReadableDuration({
							seconds: event.measurePeriod,
							asObject: true,
						}).val
					}}
					<span>
						{{
							pluralize(
								toReadableDuration({
									seconds: event.measurePeriod,
									asObject: true,
								}).val,
								toReadableDuration({
									seconds: event.measurePeriod,
									asObject: true,
								}).text,
							)
						}}
					</span>
				</div>
			</div>

			<div
				:class="[
					$style.card__bottom,
					isHighdemand && $style.highdemand_radius,
				]"
			>
				<div
					:class="[
						$style.card__side,
						['STARTED', 'FINISHED'].includes(event.status) &&
							$style.opacity,
					]"
				>
					<div :class="$style.card__time">
						{{ timing.start.time
						}}<span>, {{ timing.start.date }}</span>
					</div>
					<div :class="$style.card__day">{{ timing.start.day }}</div>
				</div>

				<div
					:class="[
						$style.card__side,
						$style.right,
						event.status == 'FINISHED' && $style.opacity,
					]"
				>
					<div :class="$style.card__time">
						<span>{{ timing.end.date }}, </span>
						{{ timing.end.time }}
					</div>
					<div :class="$style.card__day">{{ timing.end.day }}</div>
				</div>

				<Icon
					name="arrowright"
					size="14"
					:class="$style.card__arrow_icon"
				/>
			</div>

			<div v-if="isHighdemand" :class="$style.card__highdemand">
				<div :class="$style.left">
					<Icon name="bolt" size="14" />
					<span>High-demand</span>
				</div>

				<span
					>{{ event.bets.length }} stakes&nbsp;&nbsp;•&nbsp;&nbsp;{{
						numberWithSymbol(event.totalValueLocked.toFixed(0), ",")
					}}
					liquidity</span
				>
			</div>
		</div>

		<div :class="$style.params">
			<!-- First Param -->
			<!-- *New/Starting* -->
			<div
				v-if="
					['In progress', 'Finished'].includes(startStatus) &&
					event.status == 'NEW'
				"
				:class="$style.param"
			>
				<span><Icon name="time" size="14" />Start</span>

				<span v-if="startStatus == 'In progress'">
					<!-- in X days -->
					<template v-if="endDiff.hours > 24">
						{{
							DateTime.fromISO(event.betsCloseTime)
								.setLocale("en")
								.toRelative()
						}}
					</template>
					<!-- 00:00:00 -->
					<template v-else>
						{{ startCountdown }}
					</template>
				</span>
				<span v-else-if="startStatus == 'Finished'">Soon</span>
			</div>

			<!-- *Active* -->
			<div
				v-else-if="
					startStatus == 'Finished' && event.status == 'STARTED'
				"
				:class="$style.param"
			>
				<span> <Icon name="time" size="14" />Finish </span>

				<span v-if="finishStatus == 'In progress'">
					<!-- in X days -->
					<template v-if="endDiff.hours > 24">
						{{
							DateTime.fromISO(event.betsCloseTime)
								.setLocale("en")
								.plus({ second: event.measurePeriod })
								.toRelative()
						}}
					</template>
					<!-- 00:00:00 -->
					<template v-else>
						{{ finishCountdown }}
					</template>
				</span>
				<span v-else-if="finishStatus == 'Finished'">Soon</span>
			</div>

			<!-- *Finished* -->
			<div
				v-else-if="
					startStatus == 'Finished' && event.status == 'FINISHED'
				"
				:class="$style.param"
			>
				<span>
					<Icon name="checkcircle" size="14" />
					Won Side
				</span>

				<span
					:class="
						priceDynamics.diff > 0
							? $style.green_icon
							: $style.red_icon
					"
					><Icon name="arrow_circle_top_right" size="12" />{{
						event.winnerBets == "ABOVE_EQ" ? "Up" : "Down"
					}}</span
				>
			</div>

			<!-- *Canceled* -->
			<div v-else-if="event.status == 'CANCELED'" :class="$style.param">
				<span> <Icon name="time" size="14" /> Won Side </span>

				<span>Draw</span>
			</div>

			<!-- Second Param -->
			<!-- *New/Starting* -->
			<Tooltip
				v-if="
					['In progress', 'Finished'].includes(startStatus) &&
					event.status == 'NEW'
				"
				placement="top"
				:button="{
					icon: 'book',
					text: 'Learn More',
					url: '/docs',
					type: 'secondary',
				}"
				is-wide
			>
				<div :class="$style.param">
					<span><Icon name="sides" size="14" />Target Dynamics</span>

					<span>
						<Icon
							:name="
								(event.targetDynamics == 1 && 'checkcircle') ||
								([1.05, 0.95].includes(event.targetDynamics) &&
									'warning') ||
								'warning'
							"
							size="12"
							:style="{
								fill: `var(--${
									(event.targetDynamics == 1 && 'green') ||
									([1.05, 0.95].includes(
										event.targetDynamics,
									) &&
										'yellow') ||
									'red'
								})`,
							}"
						/>

						{{ event.targetDynamics * 100 - 100 }}%</span
					>
				</div>

				<template #content
					>Price change that separates betting pools
				</template>
			</Tooltip>

			<!-- *Active/Finished* -->
			<div
				v-if="
					startStatus == 'Finished' &&
					['STARTED', 'FINISHED'].includes(event.status)
				"
				:class="$style.param"
			>
				<span>
					<Icon
						v-if="event.winnerBets == 'BELOW'"
						name="lower_won"
						size="14"
					/>
					<Icon
						v-else-if="event.winnerBets == 'ABOVE_EQ'"
						name="higher_won"
						size="14"
					/>
					<Icon v-else name="sides" size="14" />

					Price Dynamics
				</span>

				<span
					v-if="priceDynamics.diff"
					:class="
						priceDynamics.diff > 0
							? $style.green_full
							: $style.red_full
					"
					><Icon name="carret" size="12" />{{
						Math.abs(priceDynamics.diff).toFixed(2)
					}}
					({{ priceDynamics.percent.toFixed(2) }}%)</span
				>
				<span v-else> 0.00 (0.00%) </span>
			</div>

			<!-- *Canceled* -->
			<div v-if="event.status == 'CANCELED'" :class="$style.param">
				<span>
					<Icon name="sides" size="14" />
					Price Dynamics</span
				>

				<span> 0.00 (0.00%) </span>
			</div>
		</div>

		<EventActions
			primary
			large
			@onBet="(target) => emit('onBet', target)"
			@onWithdraw="emit('onWithdraw')"
			:event="event"
			:isWon="isWon"
			:positionForWithdraw="positionForWithdraw"
			:disabled="
				event.totalLiquidityProvided == 0 || startStatus == 'Finished'
			"
			:isWithdrawing="isWithdrawing"
			:class="$style.event_actions"
		/>
	</div>
</template>

<style module>
.wrapper {
	border-radius: 8px;
	border-top: 3px solid var(--border);
	background: var(--card-bg);

	padding: 16px 20px 20px 20px;
}

.header {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.title {
	display: flex;
	align-items: center;

	height: 20px;

	font-size: 14px;
	font-weight: 600;
	color: var(--text-primary);
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
	position: absolute;
	top: -4px;
	right: -4px;
	box-sizing: content-box;

	background: var(--card-bg);
	border-radius: 50%;
}

.user_avatar {
	width: 34px;
	height: 34px;

	background: var(--app-bg);
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

	background: var(--app-bg);
	border-radius: 50px;
	border: 3px solid var(--card-bg);
}

.card {
	display: flex;
	flex-direction: column;
	gap: 4px;

	margin-top: 16px;
}

.card__header {
	display: flex;
	align-items: center;
	justify-content: space-between;

	background: rgba(255, 255, 255, 0.03);
	border-radius: 6px 6px 2px 2px;
	padding: 0 14px;
	height: 42px;
}

.card__status {
	display: flex;
	align-items: center;
	gap: 8px;

	font-size: 14px;
	line-height: 1;
	font-weight: 600;
}

.card__status.green {
	color: var(--green);
	fill: var(--green);
}

.card__status.yellow {
	color: var(--yellow);
	fill: var(--yellow);
}

.card__status.gray {
	color: var(--text-secondary);
	fill: var(--text-secondary);
}

.card__status.purple {
	color: var(--purple);
	fill: var(--purple);
}

.card__duration {
	font-size: 13px;
	line-height: 1.1;
	font-weight: 600;
	color: var(--text-secondary);
}

.card__duration span {
	color: var(--text-tertiary);
}

.card__bottom {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: space-between;

	background: rgba(255, 255, 255, 0.03);
	border-radius: 2px 2px 6px 6px;
	padding: 0 14px;
	height: 62px;
}

.card__bottom.highdemand_radius {
	border-radius: 2px;
}

.left {
	display: flex;
	align-items: center;
	gap: 8px;
}

.card__highdemand {
	display: flex;
	align-items: center;
	justify-content: space-between;

	background: rgba(239, 132, 86, 0.15);
	color: var(--orange);
	fill: var(--orange);
	height: 34px;
	padding: 0 14px;
	border-radius: 2px 2px 6px 6px;
}

.card__highdemand span {
	font-size: 12px;
	line-height: 1;
	font-weight: 500;
}

.card__highdemand .left span {
	font-weight: 600;
}

.card__side {
	display: flex;
	flex-direction: column;
	gap: 6px;

	transition: opacity 0.2s ease;
}

.card__side.right {
	align-items: flex-end;
}

.card__side.opacity {
	opacity: 0.5;
}

.card__side:hover {
	opacity: 1;
}

.card__time {
	font-size: 13px;
	line-height: 1.1;
	font-weight: 600;
	color: var(--text-secondary);
}

.card__time span {
	color: var(--text-tertiary);
}

.card__day {
	font-size: 13px;
	line-height: 1.1;
	font-weight: 500;
	color: var(--text-tertiary);
}

.card__arrow_icon {
	position: absolute;
	top: 50%;
	left: 50%;

	transform: translateY(-50%) translateX(-50%);

	fill: var(--text-tertiary);
}

/* Params */
.params {
	display: flex;
	flex-direction: column;
	gap: 20px;

	margin-top: 32px;
}

.param {
	display: flex;
	justify-content: space-between;

	width: 100%;

	font-size: 14px;
	line-height: 1;
	font-weight: 600;
}

.param span:nth-child(1) {
	color: var(--text-tertiary);

	display: flex;
	align-items: center;
	gap: 6px;
	fill: var(--opacity-40);
}

.param span:nth-child(2) {
	display: flex;
	align-items: center;
	gap: 6px;

	color: var(--text-secondary);
}

.param span:nth-child(2).green_full {
	color: var(--green);
	fill: var(--green);
}

.param span:nth-child(2).red_full {
	color: var(--red);
	fill: var(--red);
}

.param span:nth-child(2).green_icon {
	fill: var(--green);
}

.param span:nth-child(2).red_icon {
	fill: var(--red);
}

.param span:nth-child(2).red_icon svg,
.param span:nth-child(2).red_full svg {
	transform: scaleY(-1);
}

.param span:nth-child(1) img {
	width: 12px;
}

.event_actions {
	margin-top: 24px;
}
</style>
