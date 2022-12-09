<script setup>
/**
 * Vendor
 */
import { computed } from "vue"

/**
 * UI
 */
import LoadingDots from "@ui/LoadingDots.vue"

/**
 * Services
 */
import { numberWithSymbol } from "@utils/amounts"

const props = defineProps({
	poolsStates: Object,
	pools: Array,
})

const isReady = computed(
	() =>
		Object.keys(props.poolsStates).length === props.pools.length &&
		props.pools.length > 0,
)

const stats = computed(() => {
	let valueOfPools = 0
	let avgSharePrice = 0

	Object.keys(props.poolsStates).forEach((address) => {
		valueOfPools += props.poolsStates[address].totalLiquidity.toNumber()
		avgSharePrice += props.poolsStates[address].sharePrice.toNumber()
	})

	return {
		valueOfPools,
		avgSharePrice: avgSharePrice / Object.keys(props.poolsStates).length,
	}
})
</script>

<template>
	<Flex align="center" justify="between" gap="16" :class="$style.stats">
		<Flex direction="column" gap="8" :class="$style.stat">
			<Flex align="center" gap="6" :class="$style.stat__values">
				<Text v-if="isReady" size="16" weight="600" color="primary">
					{{ numberWithSymbol(stats.valueOfPools.toFixed(0), ",") }}
				</Text>
				<LoadingDots v-else />

				<Flex
					align="center"
					gap="4"
					:class="[$style.badge, $style.green]"
				>
					<Icon name="arrow_circle_top" size="12" color="green" />
					<Text size="12" color="green" weight="700"> 4.25% </Text>
				</Flex>
			</Flex>

			<Text
				size="14"
				weight="500"
				color="tertiary"
				:class="$style.stat__subtitle"
			>
				Total Value Locked
			</Text>
		</Flex>

		<Flex direction="column" gap="8" :class="$style.stat">
			<Flex align="center" gap="6" :class="$style.stat__values">
				<Text v-if="isReady" size="16" weight="600" color="primary">
					{{ stats.avgSharePrice.toFixed(2) }}
				</Text>
				<LoadingDots v-else />

				<Flex
					align="center"
					gap="4"
					:class="[$style.badge, $style.green]"
				>
					<Icon name="arrow_circle_top" size="12" color="green" />
					<Text size="12" color="green" weight="700"> 4.25% </Text>
				</Flex>
			</Flex>

			<Text
				size="14"
				weight="500"
				color="tertiary"
				:class="$style.stat__subtitle"
			>
				Avg Share Price
			</Text>
		</Flex>

		<Flex direction="column" gap="8" :class="$style.stat">
			<Flex align="center" gap="6" :class="$style.stat__values">
				<Text v-if="isReady" size="16" weight="600" color="primary">
					0%
				</Text>
				<LoadingDots v-else />

				<Flex align="center" gap="4" :class="$style.badge">
					<Icon name="arrow_circle_top" size="12" color="secondary" />
					<Text size="12" color="secondary" weight="700"> 0% </Text>
				</Flex>
			</Flex>

			<Text
				size="14"
				weight="500"
				color="tertiary"
				:class="$style.stat__subtitle"
			>
				Max APY
			</Text>
		</Flex>

		<Flex direction="column" gap="8" :class="$style.stat">
			<Flex align="center" gap="6" :class="$style.stat__values">
				<Text v-if="isReady" size="16" weight="600" color="primary">
					0%
				</Text>
				<LoadingDots v-else />

				<Flex align="center" gap="4" :class="$style.badge">
					<Icon name="arrow_circle_top" size="12" color="secondary" />
					<Text size="12" color="secondary" weight="700"> 0% </Text>
				</Flex>
			</Flex>

			<Text
				size="14"
				weight="500"
				color="tertiary"
				:class="$style.stat__subtitle"
			>
				Stability
			</Text>
		</Flex>
	</Flex>
</template>

<style module>
.stat {
	flex: 1;

	border-radius: 8px;
	background: var(--card-bg);

	padding: 20px 24px;
}

.stat__subtitle {
	white-space: nowrap;
}

.badge {
	padding: 2px;
	border-radius: 50px;
	background: rgba(255, 255, 255, 0.05);
}

.badge.green {
	background: rgba(26, 161, 104, 0.15);
}

.badge.red {
	background: rgba(224, 92, 67, 0.15);
}

.tooltip_card {
	width: 250px;
}

@media (max-width: 1200px) {
	.stats {
		flex-direction: column;
	}

	.stat {
		width: 100%;

		flex-direction: row-reverse;
		justify-content: space-between;
	}

	.stat__values {
		flex-direction: row-reverse;
	}
}
</style>
