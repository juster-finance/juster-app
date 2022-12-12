<script setup>
/**
 * Vendor
 */
import { ref, reactive, computed } from "vue"

const props = defineProps({
	positions: Array,
})

const tabs = reactive([
	{
		icon: "splitted_chart",
		title: "TVL",
	},
	// {
	// 	icon: "splitted_chart",
	// 	title: "APY",
	// },
	// {
	// 	icon: "money",
	// 	title: "Profit",
	// },
])
const selectedTab = ref(tabs[0].title)

const valueLocked = computed(() =>
	props.positions.reduce(
		(acc, curr) => (acc = acc + curr.depositedAmount),
		0,
	),
)

// const poolsDistribution = computed(() => {
// 	const distribution = []

// 	props.positions.forEach((entry) => {
// 		if (!distribution.length) {
// 			distribution.push({
// 				name: entry.pool.name,
// 				tvl: entry.amount,
// 			})
// 		} else {
// 			const pool = distribution.find((e) => e.name === entry.pool.name)

// 			if (pool) {
// 				pool.tvl += entry.amount
// 			} else {
// 				distribution.push({
// 					name: entry.pool.name,
// 					tvl: entry.amount,
// 				})
// 			}
// 		}
// 	})

// 	return distribution.sort((a, b) => b.tvl - a.tvl)
// })

const sortedPositions = computed(() => {
	const sPositions = props.positions.map((position) => {
		return {
			...position,
			tvl: position.depositedAmount,
		}
	})

	return sPositions.sort((a, b) => b.tvl - a.tvl)
})
</script>

<template>
	<div :class="$style.wrapper">
		<Flex direction="column" gap="8" :class="$style.head">
			<Text color="primary" size="16" weight="600">My Statistics</Text>
			<Text color="tertiary" size="14" weight="500" height="14">
				Splitted data by pools
			</Text>
		</Flex>

		<Flex direction="column" gap="24">
			<Flex direction="column" gap="8">
				<Flex align="center" justify="between">
					<Text color="secondary" size="13" weight="600">
						Total Value
					</Text>

					<Text color="secondary" size="13" weight="600">
						{{ valueLocked.toFixed(2) }}
					</Text>
				</Flex>

				<div :class="$style.progress_wrapper">
					<div v-if="valueLocked" :class="$style.bar_progress" />
				</div>

				<!-- Hint for empty state -->
				<Text
					v-if="!valueLocked"
					size="12"
					color="support"
					weight="500"
					height="16"
				>
					After the first deposits here you will see what pools were
					provided with liquidity and in what amount
				</Text>
			</Flex>

			<template v-if="valueLocked">
				<Flex
					v-for="position in sortedPositions"
					direction="column"
					gap="8"
				>
					<Flex align="center" justify="between">
						<Text color="secondary" size="13" weight="600">
							{{
								position.pool.name.replace("Juster Pool: ", "")
							}}
						</Text>

						<Flex align="center" gap="8">
							<Text color="tertiary" size="13" weight="600">
								{{
									(
										(position.tvl * 100) /
										valueLocked
									).toFixed(0)
								}}%
							</Text>

							<Text color="secondary" size="13" weight="600">
								{{ position.tvl.toFixed(2) }}
							</Text>
						</Flex>
					</Flex>

					<Flex :class="$style.progress_wrapper">
						<div
							:style="{
								width: `${(position.tvl * 100) / valueLocked}%`,
								borderRadius: '0 3px 3px 0',
							}"
							:class="$style.bar_deposited"
						/>
						<!-- <div
							:style="{
								width: `${30}%`,
								borderRadius: '0 3px 3px 0',
							}"
							:class="$style.bar_locked"
						/> -->
					</Flex>
				</Flex>
			</template>

			<Flex align="center" gap="16">
				<Flex align="center" gap="6">
					<div :class="$style.deposited_dot" />
					<Text size="12" weight="600" color="secondary">
						Total Deposited
					</Text>
				</Flex>
				<Flex align="center" gap="6">
					<div :class="$style.locked_dot" />
					<Text size="12" weight="600" color="secondary"
						>Total Value Locked</Text
					>
				</Flex>
			</Flex>
		</Flex>

		<Flex align="center" gap="6" :class="$style.tabs">
			<Flex
				v-for="(tab, i) in tabs"
				:key="i"
				@click="selectedTab = tab.title"
				align="center"
				gap="8"
				:class="[
					$style.tab,
					selectedTab === tab.title && $style.active,
				]"
			>
				<Icon :name="tab.icon" size="14" color="tertiary" />
				<Text size="14" weight="600">{{ tab.title }}</Text>
			</Flex>
		</Flex>
	</div>
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
	margin-bottom: 24px;
}

.progress_wrapper {
	width: 100%;
	height: 12px;
	border-radius: 3px;
	overflow: hidden;
	background: rgba(255, 255, 255, 0.05);
}

.bar_progress {
	width: 100%;
	height: 100%;
	background: var(--blue);
	border-radius: 3px;

	transition: width 1s ease;
}

.bar_deposited {
	height: 100%;

	background: var(--blue);

	transition: width 1s ease;
}

.bar_locked {
	height: 100%;

	background: #3a568e;

	transition: width 1s ease;
}

.tabs {
	border-top: 1px solid var(--border);

	padding-top: 20px;
	margin-top: 24px;
}

.tab {
	height: 32px;
	border-radius: 6px;
	cursor: pointer;

	color: var(--text-secondary);

	padding: 0 12px;

	transition: color 0.2s ease, background 0.2s ease;
}

.tab:hover {
	color: var(--text-primary);
}

.tab.active {
	background: rgba(255, 255, 255, 0.05);
	color: var(--text-primary);
}

.deposited_dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: var(--blue);
}

.locked_dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: #3a568e;
}
</style>
