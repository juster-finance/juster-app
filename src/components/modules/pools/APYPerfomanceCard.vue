<script setup>
/**
 * Vendor
 */
import { computed } from "vue"

/**
 * Services
 */
import { parsePoolName } from "@utils/misc"

const props = defineProps({
	pool: Object,
	apy: Number,
	apys: Object,
	riskIndex: Number,
	utilization: Number,
})

const apyPosition = computed(() => {
	const apys = Object.keys(props.apys).map((a) => props.apys[a])
	const maxAPY = Math.max(...apys)
	const minAPY = Math.min(...apys)

	const position = (100 * (props.apy - minAPY)) / (maxAPY - minAPY)

	return !isNaN(position) ? position : 0
})
</script>

<template>
	<Flex direction="column" gap="24" :class="$style.wrapper">
		<Flex align="center" gap="8" :class="$style.head">
			<Icon name="stars" size="16" color="green" />
			<Text color="primary" size="16" weight="600">APY Perfomance</Text>
		</Flex>

		<Flex align="center" gap="10">
			<Text size="16" weight="600" :color="apy * 100 < 0 ? 'tertiary' : 'secondary'" :class="$style.apy_txt">
				{{ (apy * 100).toFixed(2) }}%
			</Text>

			<div :class="$style.bar">
				<div :class="$style.dot" :style="{ left: apyPosition && `calc(${apyPosition}% - 16px)` }" />
			</div>
		</Flex>

		<Flex v-if="pool" direction="column" gap="24">
			<div>
				<Text size="14" height="18" weight="500" color="tertiary">
					Pool {{ parsePoolName(pool.name.replace("Juster Pool: ", "")) }} with a current APY has a
				</Text>
				<Text size="14" height="18" weight="500" color="secondary">
					<Icon :name="(riskIndex > 1 && 'warning') || 'checkcircle'" size="12" :color="(riskIndex > 1 && 'red') || 'tertiary'" />
					{{ riskIndex.toFixed(2) }}%
				</Text>
				<Text size="14" height="18" weight="500" color="tertiary">risk index and </Text>
				<Text size="14" height="18" weight="500" color="secondary">
					<Icon
						:name="(utilization < 0.01 && 'warning') || 'checkcircle'"
						size="12"
						:color="
							(utilization <= 0.01 && 'red') ||
							(utilization > 0.01 && utilization < 0.1 && 'tertiary') ||
							(utilization >= 0.1 && 'green') ||
							'tertiary'
						"
					/>
					{{ utilization.toFixed(2) }}%
				</Text>
				<Text size="14" height="16" weight="500" color="tertiary">utilization</Text>
			</div>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	width: 100%;

	border-radius: 8px;
	background: var(--card-bg);
	border-top: 3px solid var(--border);

	padding: 24px;
}

.head {
	border-bottom: 1px solid var(--border);

	padding-bottom: 20px;
}

.apy_txt {
	min-width: 65px;
}

.bar {
	position: relative;
	width: 100%;
	height: 8px;

	border-radius: 50px;
	background: linear-gradient(90deg, transparent, var(--green), var(--orange));
}

.dot {
	position: absolute;
	top: -5px;
	left: 0%;

	width: 10px;
	height: 10px;
	border-radius: 50px;

	background: #fff;
	border: 4px solid var(--card-bg);
	box-sizing: content-box;

	transition: all 1s var(--bezier);
}
</style>
