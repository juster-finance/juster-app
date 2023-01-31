<script setup>
/**
 * Vendor
 */
import { computed } from "vue"
import BN from "bignumber.js"

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
	poolsAPY: Object,
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
		const { totalLiquidity, sharePrice } = props.poolsStates[address]

		valueOfPools += BN.isBigNumber(totalLiquidity)
			? totalLiquidity.toNumber()
			: totalLiquidity
		avgSharePrice += BN.isBigNumber(sharePrice)
			? sharePrice.toNumber()
			: sharePrice
	})

	return {
		valueOfPools,
		avgSharePrice: avgSharePrice / Object.keys(props.poolsStates).length,
	}
})

const apy = computed(() => {
	if (!props.poolsAPY) return { min: 0, max: 0 }
	const apys = Object.keys(props.poolsAPY).map((p) => props.poolsAPY[p])
	return { min: Math.min(...apys), max: Math.max(...apys) }
})
</script>

<template>
	<Flex align="center" justify="between" gap="16" :class="$style.stats">
		<Flex direction="column" justify="center" gap="8" :class="$style.stat">
			<Flex align="center" gap="6" :class="$style.stat__values">
				<Text v-if="isReady" size="16" weight="600" color="primary">
					{{
						stats.valueOfPools
							? numberWithSymbol(stats.valueOfPools, ",")
							: 0
					}}
				</Text>
				<LoadingDots v-else :class="$style.dots_anim" />

				<!-- <Flex
					align="center"
					gap="4"
					:class="[$style.badge, $style.green]"
				>
					<Icon name="arrow_circle_top" size="12" color="green" />
					<Text size="12" color="green" weight="700"> 4.25% </Text>
				</Flex> -->
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

		<!-- Max APY -> PoolsBase -->
		<!-- Shares -> PoolBase -->
		<Flex
			v-if="pools.length > 1"
			direction="column"
			justify="center"
			gap="8"
			:class="$style.stat"
		>
			<Flex align="center" gap="6" :class="$style.stat__values">
				<Text v-if="isReady" size="16" weight="600" color="primary">
					{{ numberWithSymbol(apy.max * 100, ",") }}%
				</Text>
				<LoadingDots v-else :class="$style.dots_anim" />

				<!-- <Flex
					align="center"
					gap="4"
					:class="[$style.badge, $style.green]"
				>
					<Icon name="arrow_circle_top" size="12" color="green" />
					<Text size="12" color="green" weight="700"> 4.25% </Text>
				</Flex> -->
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
		<Flex
			v-else
			direction="column"
			justify="center"
			gap="8"
			:class="$style.stat"
		>
			<Flex align="center" gap="6" :class="$style.stat__values">
				<Text v-if="isReady" size="16" weight="600" color="primary">
					{{
						poolsStates[0].totalShares
							? numberWithSymbol(poolsStates[0].totalShares, ",")
							: 0
					}}
				</Text>
				<LoadingDots v-else :class="$style.dots_anim" />
			</Flex>

			<Text
				size="14"
				weight="500"
				color="tertiary"
				:class="$style.stat__subtitle"
			>
				Shares
			</Text>
		</Flex>

		<Flex
			v-if="pools.length > 1"
			direction="column"
			justify="center"
			gap="8"
			:class="$style.stat"
		>
			<Flex align="center" gap="6" :class="$style.stat__values">
				<Text v-if="isReady" size="16" weight="600" color="primary">
					{{ (apy.min * 100).toFixed(2) }}%
				</Text>
				<LoadingDots v-else :class="$style.dots_anim" />

				<!-- <Flex align="center" gap="4" :class="$style.badge">
					<Icon name="arrow_circle_top" size="12" color="secondary" />
					<Text size="12" color="secondary" weight="700"> 0% </Text>
				</Flex> -->
			</Flex>

			<Text
				size="14"
				weight="500"
				color="tertiary"
				:class="$style.stat__subtitle"
			>
				Min APY
			</Text>
		</Flex>
		<Flex
			v-else
			direction="column"
			justify="center"
			gap="8"
			:class="$style.stat"
		>
			<Flex align="center" gap="6" :class="$style.stat__values">
				<Text v-if="isReady" size="16" weight="600" color="primary">
					{{
						poolsStates[0].sharePrice
							? poolsStates[0].sharePrice.toFixed(2)
							: 0
					}}
				</Text>
				<LoadingDots v-else :class="$style.dots_anim" />

				<!-- <Flex align="center" gap="4" :class="$style.badge">
					<Icon name="arrow_circle_top" size="12" color="secondary" />
					<Text size="12" color="secondary" weight="700"> 0% </Text>
				</Flex> -->
			</Flex>

			<Text
				size="14"
				weight="500"
				color="tertiary"
				:class="$style.stat__subtitle"
			>
				Price
			</Text>
		</Flex>

		<Flex direction="column" justify="center" gap="8" :class="$style.stat">
			<Flex align="center" gap="6" :class="$style.stat__values">
				<Text v-if="isReady" size="16" weight="600" color="primary">
					0%
				</Text>
				<LoadingDots v-else :class="$style.dots_anim" />

				<!-- <Flex align="center" gap="4" :class="$style.badge">
					<Icon name="arrow_circle_top" size="12" color="secondary" />
					<Text size="12" color="secondary" weight="700"> 0% </Text>
				</Flex> -->
			</Flex>

			<Text
				size="14"
				weight="500"
				color="tertiary"
				:class="$style.stat__subtitle"
			>
				Utilization
			</Text>
		</Flex>
	</Flex>
</template>

<style module>
.stat {
	flex: 1;

	min-height: 78px;

	border-radius: 8px;
	background: var(--card-bg);

	padding: 0 24px;
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

.dots_anim {
	height: 16px;
}

@media (max-width: 1200px) {
	.stats {
		flex-direction: column;
	}

	.stat {
		width: 100%;
		min-height: 60px;

		flex-direction: row-reverse;
		justify-content: space-between;
	}

	.stat__values {
		flex-direction: row-reverse;
	}

	.stat__subtitle {
		display: flex;
		align-items: center;
	}
}
</style>
