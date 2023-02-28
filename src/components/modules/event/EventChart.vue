<script setup>
import { ref } from "vue"

/**
 * Charts
 */
import EventPriceChart from "@modules/events/charts/EventPriceChart.vue"
import EventTVLChart from "@modules/events/charts/EventTVLChart.vue"

/**
 * UI
 */
import Tooltip from "@ui/Tooltip.vue"

defineProps({ event: { type: Object, default: () => {} }, priceDynamics: { type: Object } })

const isOpen = ref(true)

const selectedTab = ref("Price")
const tabs = ref(["Price"])
</script>

<template>
	<div :class="$style.wrapper">
		<div @click="isOpen = !isOpen" :class="$style.header">
			<Text size="14" weight="600" color="primary">
				{{ event.currencyPair.symbol.replace("-", "/") }}
			</Text>

			<Icon name="arrow" size="20" :class="!isOpen && $style.rotate" />
		</div>

		<div v-show="isOpen" :class="$style.base">
			<!-- Price Chart -->
			<EventPriceChart v-if="selectedTab == 'Price'" :event="event" :priceDynamics="priceDynamics" />

			<!-- TVL Chart -->
			<EventTVLChart v-else-if="selectedTab == 'TVL'" :event="event" />
		</div>

		<div v-show="isOpen" :class="$style.bottom">
			<!-- Tabs: Price, TVL, Liquidity -->
			<div :class="$style.tabs">
				<div v-for="tab in tabs" :key="tab" @click="selectedTab = tab" :class="[$style.tab, tab == selectedTab && $style.active]">
					{{ tab }}
				</div>
			</div>

			<Tooltip placement="bottom-end" text-align="right">
				<Icon name="help" size="14" color="tertiary" />

				<template #content>
					Gray Chart <span>- price before start</span><br />
					Green / Red Chart
					<span>- price above / below the starting point</span><br />
				</template>
			</Tooltip>
		</div>
	</div>
</template>

<style module>
.wrapper {
	border-radius: 8px;
	border-top: 3px solid var(--border);
	background: var(--card-bg);

	padding: 4px;
}

.header {
	display: flex;
	align-items: center;
	justify-content: space-between;

	cursor: pointer;
	padding: 12px 16px 12px 16px;
	border-radius: 6px;

	transition: background 0.15s ease;
}

.header:hover {
	background: var(--opacity-05);
}

.header svg {
	fill: var(--icon);
	transform: rotate(180deg);

	transition: transform 0.2s ease;
}

.header svg.rotate {
	transform: rotate(360deg);
}

.base {
	position: relative;

	margin: 16px 16px 24px 16px;
}

.bottom {
	display: flex;
	align-items: flex-end;
	justify-content: space-between;

	padding: 0 16px 16px 16px;
}

.tabs {
	display: flex;
	align-items: center;
	gap: 6px;
}

.tab {
	display: flex;
	align-items: center;

	font-size: 12px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-tertiary);

	height: 24px;
	cursor: pointer;
	border-radius: 4px;

	padding: 0 8px;

	transition: all 0.2s ease;
}

.tab:hover {
	color: var(--text-secondary);
}

.tab.active {
	color: var(--text-primary);
	background: var(--opacity-05);
}
</style>
