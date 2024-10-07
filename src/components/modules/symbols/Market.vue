<script setup>
/**
 * Vendor
 */
import { ref, computed } from "vue"
import { useRouter } from "vue-router"

/**
 * UI
 */
import Button from "@ui/Button.vue"

/**
 * Services
 */
import { numberWithSymbol, calcChange, abbreviateNumber } from "@utils/amounts"
import { supportedMarkets } from "@config"

/**
 * Store
 */
import { useMarketStore } from "@store/market"

const router = useRouter()

const props = defineProps({
	market: Object,
	isShowEventsButtonVisible: Boolean,
})

const emit = defineEmits(["onJoin"])

const marketStore = useMarketStore()
const quotes = computed(() => {
	return marketStore.markets[props.market.symbol].quotes
})

const price = computed(() => {
	return {
		integer: numberWithSymbol(quotes.value[0].price.toString().split(".")[0], ","),
		fraction: quotes.value[0].price.toString().split(".")[1] || '00',
	}
})

const color = ref("grey")
const change = computed(() => {
	if (!quotes.value) return

	if (!props.market.historyPrice) return "Loading"

	const { diff, percent, isIncreased } = calcChange(quotes.value[0].price, props.market.historyPrice)
	color.value = isIncreased ? "green" : "red"

	return `${numberWithSymbol(diff.toFixed(2), " ")}, ${percent.toFixed(2)}%, 1W`
})

const handleJoin = () => {
	emit("onJoin")
}
</script>

<template>
	<div @click="router.push(`/markets/${market.symbol}`)" :class="$style.wrapper">
		<Flex align="center" justify="between" :class="$style.content">
			<div :class="$style.base">
				<div :class="$style.name">
					{{ market.symbol }},
					<span>{{ supportedMarkets[market.symbol].description }}</span>
				</div>

				<h1 v-if="quotes.length" :class="$style.price">
					$ {{ price.integer }}<span>.{{ price.fraction.slice(0, 2) }}</span>
				</h1>

				<div :class="[$style.diff, $style[color]]"><Icon v-if="change !== 'Loading'" name="carret" size="12" />{{ change }}</div>
			</div>

			<div :class="$style.right">
				<Button v-if="isShowEventsButtonVisible" @click="handleJoin" size="medium" type="secondary" :class="$style.btn">
					<Icon name="collection" size="16" />
					View events
				</Button>

				<div :class="$style.info">
					<div :class="$style.param">
						<span :class="$style.param_name">Events:</span>
						<span :class="$style.param_value">{{ market.totalEvents }}</span>
					</div>

					<div :class="$style.dot" />

					<div :class="$style.param">
						<span :class="$style.param_name">TVL:</span>
						<Flex :class="$style.param_value" align="end" gap="2">
							<span>
								{{ abbreviateNumber(market.totalValueLocked.toFixed(0)) }} 
							</span>
							<TokenSymbol size="13"/>
						</Flex>
					</div>

					<div :class="$style.dot" />

					<div :class="$style.param">
						<span :class="$style.param_name">Volume (24h):</span>
						<Flex :class="$style.param_value" align="end" gap="2">
							<span>
								{{ abbreviateNumber(market.totalVolume.toFixed(0)) }} 
							</span>
							<TokenSymbol size="13"/>
						</Flex>
					</div>
				</div>
			</div>
		</Flex>
	</div>
</template>

<style module>
.wrapper {
	min-height: 132px;

	border-radius: 10px;
	outline: 2px solid transparent;
	background: var(--card-bg);

	cursor: pointer;
	padding: 24px;

	transition: outline 0.2s ease;
}

.wrapper:hover {
	outline: 2px solid var(--border);
}

.name {
	font-size: 12px;
	font-weight: 500;
	line-height: 1;
	color: var(--text-primary);

	margin-bottom: 20px;
}

.name span {
	color: var(--text-tertiary);
}

.price {
	margin-bottom: 12px;
}

.price span {
	color: var(--text-tertiary);
}

.diff {
	font-size: 13px;
	font-weight: 600;
	line-height: 1;

	width: fit-content;
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 4px;
	border-radius: 5px;
}

.diff.grey {
	color: rgba(255, 255, 255, 0.3);
}

.diff.green {
	color: var(--green);
	fill: var(--green);
	background: rgba(26, 161, 104, 0.15);
}

.diff.red {
	color: var(--red);
	fill: var(--red);
	background: rgba(224, 92, 67, 0.15);
}

.diff.red svg {
	transform: rotate(180deg);
}

.right {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	justify-content: space-between;
	gap: 45px;
}

.info {
	display: flex;
	align-items: center;
	gap: 16px;
}

.param {
	display: flex;
	align-items: flex-end;
	gap: 4px;

	font-size: 13px;
	line-height: 1;
	font-weight: 500;
}

.param_name {
	color: var(--text-tertiary);
}

.param_value {
	color: var(--text-primary);
}

.dot {
	width: 4px;
	height: 4px;
	border-radius: 50%;
	background: var(--opacity-20);
}

@media (max-width: 700px) {
	.content {
		flex-direction: column;
		align-items: flex-start;

		gap: 40px;
	}

	.right {
		flex-direction: column-reverse;
		align-items: flex-start;
		gap: 20px;
	}
}

@media (max-width: 500px) {
	.info {
		flex-direction: column;
		align-items: flex-start;
	}

	.dot {
		display: none;
	}
}
</style>
