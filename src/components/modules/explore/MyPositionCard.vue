<script setup>
/**
 * Vendor
 */
import { computed } from "vue"
import { DateTime } from "luxon"

/**
 * UI
 */
import Badge from "@ui/Badge.vue"

/**
 * Services
 */
import { supportedMarkets } from "@config"
import { toReadableDuration } from "@utils/date"
import { abbreviateNumber } from "@utils/amounts"

/**
 * Store
 */
import { useAccountStore } from "@store/account"

const accountStore = useAccountStore()

const props = defineProps({
	event: { type: Object, required: true },
})

const symbol = computed(() => props.event.currencyPair.symbol)

const eventDuration = computed(() =>
	toReadableDuration({ seconds: props.event.measurePeriod }),
)

const timing = computed(() => {
	const eventDt = DateTime.fromISO(props.event.betsCloseTime).setLocale("en")

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

const value = computed(() => {
	const bets = props.event.bets.reduce((acc, curr) => {
		if (curr.userId == accountStore.pkh) {
			return (acc += curr.amount)
		} else {
			return acc
		}
	}, 0)
	const liquidity = props.event.deposits.reduce((acc, curr) => {
		if (curr.userId == accountStore.pkh) {
			return (acc += curr.amountAboveEq)
		} else {
			return acc
		}
	}, 0)

	return abbreviateNumber(bets + liquidity)
})
</script>

<template>
	<router-link :to="`/events/${event.id}`">
		<Flex align="center" justify="between" :class="$style.wrapper">
			<Flex align="center" gap="16">
				<div
					:class="[
						$style.event_icon,
						(event.status == 'NEW' && $style.green) ||
							(event.status == 'STARTED' && $style.yellow),
					]"
				>
					<Icon
						:name="
							(event.status == 'NEW' && 'event_new') ||
							(event.status == 'STARTED' && 'event_active')
						"
						size="16"
					/>
				</div>

				<Flex direction="column" justify="center" gap="8">
					<div :class="$style.title">
						{{
							supportedMarkets[symbol] &&
							supportedMarkets[symbol].description
						}}
					</div>

					<div :class="$style.timing">
						<div :class="$style.days">
							{{
								`${timing.start.day} ${
									timing.showDay ? `- ${timing.end.day}` : ``
								} ${timing.start.month}`
							}}
						</div>

						<div :class="$style.dot" />

						<div :class="$style.hrs">
							{{ timing.start.time }}
							<span>({{ eventDuration }})</span>
						</div>
					</div>
				</Flex>
			</Flex>

			<Badge size="medium" color="gray">
				<Icon name="coins" size="14" color="tertiary" />
				{{ value }} ꜩ
			</Badge>
		</Flex>
	</router-link>
</template>

<style module>
.wrapper {
	height: 62px;
	border-radius: 8px;
	background: var(--card-bg);
	box-shadow: 0 0 0 0 transparent;

	padding: 0 16px;

	transition: all 0.2s ease;
}

.wrapper:hover {
	box-shadow: 0 0 0 2px var(--border);
}

.wrapper:focus {
	box-shadow: 0 0 0 2px var(--border);
}

.event_icon {
	display: flex;
	align-items: center;
	justify-content: center;

	height: 32px;
	width: 32px;
	border-radius: 8px;
}

.event_icon.green {
	fill: var(--purple);
	background: rgba(133, 90, 209, 0.1);
}

.event_icon.yellow {
	fill: var(--yellow);
	background: rgba(245, 183, 43, 0.1);
}

.title {
	display: flex;
	align-items: center;

	font-size: 13px;
	font-weight: 600;
	color: var(--text-primary);
}

.timing {
	display: flex;
	align-items: center;
	gap: 8px;

	font-size: 12px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-secondary);
}

.days {
	color: var(--text-tertiary);
}

.hrs span {
	color: var(--text-tertiary);
}

.dot {
	width: 4px;
	height: 4px;
	border-radius: 50%;
	background: var(--border);
}
</style>
