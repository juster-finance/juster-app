<script setup>
import { ref, computed, onMounted } from "vue"
import { DateTime } from "luxon"

/** UI */
import Tooltip from "@/components/ui/Tooltip"

/**
 * Services
 */
import { toReadableDuration } from "@/services/utils/date"
import { pluralize } from "@/services/utils/global"
import { supportedMarkets } from "@/services/config"

/**
 * API
 */
import { fetchQuoteByTimestamp } from "@/api/quotes"

/**
 * Store
 */
import { useMarketStore } from "@/store/market"

const marketStore = useMarketStore()

const props = defineProps({
	event: {
		type: Object,
		default: () => {},
	},
})

const showMore = ref(false)

const prevQuote = ref({})
const startQuote = ref({})

/**
 * ------{ prevQuote }---< measurePeriod >---{ startQuote }-------
 * ---------------------------------------------^-Start of event--
 *
 * If the event has not yet started, then use the last available quote
 * { prevQuote } is chosen relative to the start of the event or relative to the current time (before start, { currentQuote })
 */

onMounted(async () => {
	/** First Quote (to compare) */
	const prevDt = DateTime.now()
		.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
		.minus({ hour: props.event.measurePeriod / 3600 })
		.toISO()

	const rawQuote = await fetchQuoteByTimestamp({
		id: props.event.currencyPair.id,
		ts: prevDt,
	})

	prevQuote.value = rawQuote[0]

	/** Last Quote (to compare) */
	if (["STARTED", "FINISHED"].includes(props.event.status)) {
		startQuote.value.price = props.event.startRate * 100
	}
})

/**
 * Price
 */
const quotes = computed(
	() => marketStore.markets[props.event.currencyPair.symbol].quotes,
)

/** todo: move to constants */
const PriceStates = {
	WENT_UP: "WENT_UP",
	DROPPED: "DROPPED",
	UNCHANGED: "UNCHANGED",
}

const priceDetails = computed(() => {
	if (!quotes.value.length) {
		return {
			state: PriceStates.UNCHANGED,
			percentageDiff: 0,
		}
	}

	const priceToCompare = ["STARTED", "FINISHED"].includes(props.event.status)
		? startQuote.value.price
		: quotes.value[0].price

	return {
		state:
			priceToCompare - prevQuote.value.price < 0
				? PriceStates.DROPPED
				: PriceStates.WENT_UP,
		percentageDiff: (
			(Math.abs(priceToCompare - prevQuote.value.price) /
				((priceToCompare + prevQuote.value.price) / 2)) *
			100
		).toFixed(2),
	}
})

/**
 * Users
 */
const distributionOfUsers = computed(() => {
	const riseBets = props.event.bets.filter((bet) => bet.side == "ABOVE_EQ")
	const fallBets = props.event.bets.filter((bet) => bet.side == "BELOW")

	if (riseBets.length !== 0 && riseBets.length == fallBets.length) {
		return "half"
	} else if (riseBets.length == 0 && fallBets.length == 0) {
		return "no_bets"
	} else if (riseBets.length > fallBets.length) {
		return "rise"
	} else {
		return "fall"
	}
})

const distributionOfBets = computed(() => {
	const riseValueLocked = props.event.bets.filter(
		(bet) => bet.side == "ABOVE_EQ",
	)

	const fallValueLocked = props.event.bets.filter(
		(bet) => bet.side == "BELOW",
	)

	return [
		riseValueLocked.length
			? riseValueLocked.reduce((a, b) => (a += b.amount), 0)
			: 0,
		fallValueLocked.length
			? fallValueLocked.reduce((a, b) => (a += b.amount), 0)
			: 0,
	]
})
</script>

<template>
	<div :class="$style.wrapper">
		<div :class="$style.header">
			<div :class="$style.title">Details</div>

			<Tooltip placement="left">
				<Icon name="help" size="16" />

				<template #content>
					This is a bit of analysis, not a call to action or advice<br />
					<span>We cannot see the future, sorry</span>
				</template>
			</Tooltip>
		</div>

		<div :class="$style.items">
			<!-- Price -->
			<div
				v-if="quotes.length"
				:class="[
					$style.item,
					priceDetails.state == PriceStates.DROPPED
						? $style.red
						: $style.green,
				]"
			>
				<Icon
					name="lower"
					size="16"
					:class="
						priceDetails.state == PriceStates.WENT_UP &&
						$style.rotate
					"
				/>

				<div :class="$style.text">
					<p>
						{{ supportedMarkets[event.currencyPair.symbol].target }}
						{{
							priceDetails.state == PriceStates.DROPPED
								? "dropped"
								: "went up"
						}}
						by <span>{{ priceDetails.percentageDiff }}%</span> in
						last
						{{
							toReadableDuration({
								seconds: event.measurePeriod,
								asObject: true,
							}).val
						}}
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
					</p>
					<p>Relative to the start of the event</p>
				</div>
			</div>

			<!-- Users -->
			<div v-if="distributionOfUsers == 'half'" :class="[$style.item]">
				<Icon name="users" size="16" />

				<div :class="$style.text">
					<p>The bets are 50/50</p>
					<p>
						For rise {{ distributionOfBets[0].toFixed(2) }} ꜩ and
						{{ distributionOfBets[1].toFixed(2) }} ꜩ for fall
					</p>
				</div>
			</div>
			<div
				v-else-if="['rise', 'fall'].includes(distributionOfUsers)"
				:class="[
					$style.item,
					distributionOfUsers == 'rise' ? $style.green : $style.red,
				]"
			>
				<Icon name="users" size="16" />

				<div :class="$style.text">
					<p>
						Most users to the
						<span
							>"{{
								distributionOfUsers == "rise" ? "Rise" : "Fall"
							}}"</span
						>
						side
					</p>
					<p>
						For rise {{ distributionOfBets[0].toFixed(2) }} ꜩ and
						{{ distributionOfBets[1].toFixed(2) }} ꜩ for fall
					</p>
				</div>
			</div>
			<div
				v-else-if="distributionOfUsers == 'no_bets'"
				:class="[$style.item]"
			>
				<Icon name="users" size="16" />

				<div :class="$style.text">
					<p>No bets so far</p>
					<p>At least one bid is needed</p>
				</div>
			</div>

			<!-- Warning about start -->
			<div
				v-if="
					event.status == 'NEW' &&
					DateTime.fromISO(event.betsCloseTime)
						.diffNow('hour')
						.toObject().hours > 1
				"
				:class="$style.item"
			>
				<Icon name="time" size="16" />

				<div :class="$style.text">
					<p>
						The start <span>is still</span>
						{{
							DateTime.fromISO(event.betsCloseTime)
								.setLocale("en")
								.toRelative()
						}}
						away
					</p>
					<p>But fee is rising linearly</p>
				</div>
			</div>

			<template v-if="showMore">
				<!-- Warning about low activity -->
				<div
					v-if="priceDetails.percentageDiff < 1.5"
					:class="$style.item"
				>
					<Icon name="help" size="16" />

					<div :class="$style.text">
						<p>
							{{
								supportedMarkets[event.currencyPair.symbol]
									.target
							}}
							has low price activity
						</p>
						<p>Based on activity <b>before</b> the start</p>
					</div>
				</div>

				<!-- Trading View -->
				<div :class="[$style.item, $style.blue]">
					<Icon name="tradingview" size="16" />

					<div :class="$style.text">
						<p>Technical analysis <span>by</span> TradingView</p>
						<p>Not available right now</p>
					</div>
				</div>
			</template>
		</div>

		<div
			@click="showMore = !showMore"
			:class="[$style.more_btn, showMore && $style.reverse]"
		>
			<Icon name="arrow" size="14" />
		</div>
	</div>
</template>

<style module>
.wrapper {
	border-radius: 8px;
	border: 1px solid var(--border);
	padding: 20px;
	background: var(--card-bg);
}

.header {
	display: flex;
	justify-content: space-between;
	align-items: center;

	margin-bottom: 20px;
}

.header svg {
	fill: var(--text-tertiary);
	cursor: help;

	transition: fill 0.2s ease;
}

.header svg:hover {
	fill: var(--text-secondary);
}

.title {
	font-size: 14px;
	line-height: 1;
	font-weight: 500;
	color: var(--text-primary);
}

.items {
	display: flex;
	flex-direction: column;
	gap: 20px;

	margin-bottom: 20px;
}

.item {
	display: flex;
	gap: 10px;
}

.item .rotate {
	transform: rotate(180deg);
}

.item svg {
	margin-top: 3px;

	fill: var(--text-tertiary);
}

.item.green svg {
	fill: var(--green);
}

.item.red svg {
	fill: var(--red);
}

.item.blue svg {
	fill: var(--blue);
}

.text {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.text p:nth-child(1) {
	font-size: 14px;
	line-height: 1.6;
	font-weight: 600;
	color: var(--text-primary);
}

.text p:nth-child(2) {
	font-size: 13px;
	line-height: 1;
	font-weight: 500;
	color: var(--text-tertiary);
}

.text p span {
	color: var(--text-secondary);
}

.item.green .text p span {
	color: var(--green);
}

.item.red .text p span {
	color: var(--red);
}

.more_btn {
	display: flex;
	align-items: center;
	justify-content: center;

	width: 44px;
	height: 24px;
	margin: 0 auto;
	cursor: pointer;

	border-radius: 50px;
	background: rgba(255, 255, 255, 0.05);
	fill: var(--text-secondary);

	transition: all 0.2s ease;
}

.more_btn:hover {
	background: rgba(255, 255, 255, 0.1);
}

.more_btn.reverse svg {
	transform: rotate(180deg);
}

.tv_icon {
	width: 16px;
	height: 12px;
	fill: var(--text-tertiary);

	margin-top: 3px;
}
</style>
