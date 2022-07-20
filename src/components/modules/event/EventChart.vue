<script setup>
import { ref } from "vue"

/**
 * Charts
 */
import EventPriceChart from "@/components/modules/events/charts/EventPriceChart"
import EventTVLChart from "@/components/modules/events/charts/EventTVLChart"

/**
 * UI
 */
import Tooltip from "@/components/ui/Tooltip"

defineProps({ event: { type: Object, default: () => {} } })

const isOpen = ref(true)

const selectedTab = ref("Price")
const tabs = ref(["Price", "TVL"])
</script>

<template>
	<div :class="$style.wrapper">
		<div @click="isOpen = !isOpen" :class="$style.header">
			<div :class="$style.title">Chart</div>

			<Icon name="arrow" size="20" :class="!isOpen && $style.rotate" />
		</div>

		<div v-show="isOpen" :class="$style.base">
			<!-- Price Chart -->
			<EventPriceChart v-if="selectedTab == 'Price'" :event="event" />

			<!-- TVL Chart -->
			<EventTVLChart v-else-if="selectedTab == 'TVL'" :event="event" />
		</div>

		<div v-show="isOpen" :class="$style.bottom">
			<!-- Tabs: Price, TVL, Liquidity -->
			<div :class="$style.tabs">
				<div
					v-for="tab in tabs"
					:key="tab"
					@click="selectedTab = tab"
					:class="[$style.tab, tab == selectedTab && $style.active]"
				>
					{{ tab }}
				</div>
			</div>

			<Tooltip placement="bottom-end" text-align="right">
				<div :class="$style.label">
					<Icon name="help" size="12" />Details
				</div>

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
	background: var(--card-bg);
	border-radius: 8px;
	border: 1px solid var(--border);
	padding: 4px;
	flex: 1;
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

.title {
	font-size: 14px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-primary);
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
	align-items: center;
	justify-content: space-between;

	padding: 0 16px 16px 16px;
}

.label {
	display: flex;
	align-items: center;
	gap: 6px;

	font-size: 12px;
	line-height: 1;
	font-weight: 500;
	color: var(--text-tertiary);
}

.label svg {
	fill: var(--text-secondary);
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
	background: var(--btn-secondary-bg);
}
</style>
