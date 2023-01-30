<script setup>
/**
 * Vendor
 */
import { ref, reactive, computed } from "vue"

/**
 * UI
 */
import Tooltip from "@ui/Tooltip.vue"
import Toggleable from "@ui/Toggleable.vue"

/**
 * Services
 */
import { parsePoolName } from "@utils/misc"

/**
 * Store
 */
import { useMarketStore } from "@store/market"

const marketStore = useMarketStore()

const props = defineProps({
	positions: Array,
	poolsAPY: Object,
	summaries: Object,
})

const expanded = ref(true)

const tabs = reactive([
	{
		icon: "splitted_chart",
		title: "TVL",
	},
	{
		icon: "money",
		title: "Profit",
	},
])
const selectedTab = ref(tabs[0].title)

const pools = computed(() => marketStore.pools)

const valueLocked = computed(() =>
	props.positions.reduce(
		(acc, curr) => (acc = acc + curr.depositedAmount),
		0,
	),
)

const profit = computed(() => {
	let realized = 0
	let unrealized = 0

	Object.keys(props.summaries).forEach((pool) => {
		const summary = props.summaries[pool]

		realized += summary.realizedProfit
		unrealized += summary.unrealizedProfit.toNumber()
	})

	return {
		realized: realized,
		unrealized: unrealized,
		total: realized + unrealized,
	}
})

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

const sortedSummaries = computed(() => {
	const sums = Object.keys(props.summaries).map((pool) => {
		return { ...props.summaries[pool], poolId: pool }
	})

	return sums.sort((a, b) => {
		const aProfit = a.realizedProfit + a.unrealizedProfit.toNumber()
		const bProfit = b.realizedProfit + b.unrealizedProfit.toNumber()

		return aProfit - bProfit
	})
})
</script>

<template>
	<div :class="$style.wrapper">
		<Flex
			@click="expanded = !expanded"
			justify="between"
			:class="$style.head"
		>
			<Flex direction="column" gap="8">
				<Text color="primary" size="16" weight="600"
					>My Statistics</Text
				>
				<Text color="tertiary" size="14" weight="500" height="14">
					Splitted data by pools
				</Text>
			</Flex>

			<Icon
				name="arrow"
				size="20"
				color="tertiary"
				:class="[$style.arrow_icon, expanded && $style.toggle]"
			/>
		</Flex>

		<Toggleable :expanded="expanded">
			<Flex
				v-if="selectedTab === 'TVL'"
				direction="column"
				gap="24"
				:class="$style.mgs"
			>
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
						After the first deposits here you will see what pools
						were provided with liquidity and in what amount
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
									parsePoolName(
										position.pool.name.replace(
											"Juster Pool: ",
											"",
										),
									)
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
									width: `${
										(position.tvl * 100) / valueLocked
									}%`,
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

				<Flex v-if="valueLocked" align="center" gap="16">
					<Flex align="center" gap="6">
						<div :class="$style.deposited_dot" />
						<Text size="12" weight="600" color="secondary">
							Total Value Locked
						</Text>
					</Flex>
				</Flex>
			</Flex>

			<Flex
				v-else-if="selectedTab === 'Profit'"
				direction="column"
				gap="24"
				:class="$style.mgs"
			>
				<Tooltip placement="bottom" isWide>
					<Flex direction="column" gap="8" wide>
						<Flex align="center" justify="between">
							<Text color="secondary" size="13" weight="600">
								Total Profit
							</Text>

							<Text color="secondary" size="13" weight="600">
								{{
									(
										profit.realized + profit.unrealized
									).toFixed(2)
								}}
							</Text>
						</Flex>

						<Flex :class="$style.progress_wrapper">
							<Flex
								justify="end"
								:class="$style.left_wrapper"
								:style="{
									opacity: profit.total < 0 ? 1 : 0,
								}"
							>
								<Flex
									:style="{
										width: '100%',
									}"
									:class="$style.left"
								>
									<div
										:style="{
											width: `${
												(100 * profit.unrealized) /
												profit.total
											}%`,
											opacity: '0.5',
										}"
										:class="$style.bar_orange"
									/>
									<div
										:style="{
											width: `${
												100 -
												(100 * profit.unrealized) /
													profit.total
											}%`,
										}"
										:class="$style.bar_orange"
									/>
								</Flex>
							</Flex>

							<Flex
								justify="start"
								:class="$style.right_wrapper"
								:style="{
									opacity: profit.total > 0 ? 1 : 0,
								}"
							>
								<Flex
									:style="{
										width: '100%',
									}"
									:class="$style.right"
								>
									<div
										:style="{
											width: `${
												100 -
												(100 * profit.unrealized) /
													profit.total
											}%`,
										}"
										:class="$style.bar_green"
									/>
									<div
										:style="{
											width: `${
												(100 * profit.unrealized) /
												profit.total
											}%`,
											opacity: '0.5',
										}"
										:class="$style.bar_green"
									/>
								</Flex>
							</Flex>
						</Flex>
					</Flex>

					<template #content>
						Realized
						<span>{{ profit.realized.toFixed(2) }}</span
						>, Unrealized
						<span>{{ profit.unrealized.toFixed(2) }}</span>
					</template>
				</Tooltip>

				<Flex
					v-for="summary in sortedSummaries"
					direction="column"
					gap="8"
				>
					<Tooltip placement="bottom" isWide>
						<Flex direction="column" gap="8" wide>
							<Flex align="center" justify="between">
								<Text color="secondary" size="13" weight="600">
									{{
										parsePoolName(
											pools
												.find(
													(p) =>
														p.address ==
														summary.poolId,
												)
												.name.replace(
													"Juster Pool: ",
													"",
												),
										)
									}}
								</Text>

								<Text color="secondary" size="13" weight="600">
									{{
										(
											summary.realizedProfit +
											summary.unrealizedProfit.toNumber()
										).toFixed(2)
									}}
								</Text>
							</Flex>

							<Flex :class="$style.progress_wrapper">
								<Flex
									justify="end"
									:class="$style.left_wrapper"
									:style="{
										opacity:
											summary.realizedProfit +
												summary.unrealizedProfit.toNumber() <
											0
												? 1
												: 0,
									}"
								>
									<Flex
										:style="{
											width: `${
												(100 *
													(summary.realizedProfit +
														summary.unrealizedProfit.toNumber())) /
												profit.total
											}%`,
										}"
										:class="$style.left"
									>
										<div
											:style="{
												width: `${
													(100 *
														summary.unrealizedProfit.toNumber()) /
													(summary.realizedProfit +
														summary.unrealizedProfit.toNumber())
												}%`,
												opacity: '0.5',
											}"
											:class="$style.bar_orange"
										/>
										<div
											:style="{
												width: `${
													100 -
													(100 *
														summary.unrealizedProfit.toNumber()) /
														(summary.realizedProfit +
															summary.unrealizedProfit.toNumber())
												}%`,
											}"
											:class="$style.bar_orange"
										/>
									</Flex>
								</Flex>

								<Flex
									justify="start"
									:class="$style.right_wrapper"
									:style="{
										opacity:
											summary.realizedProfit +
												summary.unrealizedProfit.toNumber() >
											0
												? 1
												: 0,
									}"
								>
									<Flex
										:style="{
											width: '100%',
										}"
										:class="$style.right"
									>
										<div
											:style="{
												width: `${
													100 -
													(100 * profit.unrealized) /
														profit.total
												}%`,
											}"
											:class="$style.bar_green"
										/>
										<div
											:style="{
												width: `${
													(100 * profit.unrealized) /
													profit.total
												}%`,
												opacity: '0.5',
											}"
											:class="$style.bar_green"
										/>
									</Flex>
								</Flex>
							</Flex>
						</Flex>

						<template #content>
							Realized
							<span>{{ summary.realizedProfit.toFixed(2) }}</span
							>, Unrealized
							<span>{{
								summary.unrealizedProfit.toFixed(2)
							}}</span>
						</template>
					</Tooltip>
				</Flex>

				<Flex align="center" gap="16">
					<Flex align="center" gap="6">
						<div :class="$style.orange_dot" />
						<Text size="12" weight="600" color="secondary">
							Realized Loss
						</Text>
					</Flex>
					<Flex align="center" gap="6">
						<div :class="$style.orange_dot" style="opacity: 0.5" />
						<Text size="12" weight="600" color="secondary">
							Unrealized
						</Text>
					</Flex>

					<Flex align="center" gap="6">
						<div :class="$style.green_dot" />
						<Text size="12" weight="600" color="secondary">
							Realized Profit
						</Text>
					</Flex>
					<Flex align="center" gap="6">
						<div :class="$style.green_dot" style="opacity: 0.5" />
						<Text size="12" weight="600" color="secondary">
							Unrealized
						</Text>
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
		</Toggleable>
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
	cursor: pointer;
}

.head:hover .arrow_icon {
	fill: var(--text-secondary);
}

.arrow_icon {
	transition: all 0.2s ease;
}

.arrow_icon.toggle {
	transform: rotate(180deg);
}

.progress_wrapper {
	width: 100%;
	height: 12px;
	border-radius: 3px;
	overflow: hidden;
	background: rgba(255, 255, 255, 0.05);
}

.left_wrapper {
	width: 100%;
}

.left {
	border-radius: 3px 0 0 3px;
	overflow: hidden;
}

.right_wrapper {
	width: 100%;
}

.right {
	border-radius: 0 3px 3px 0;
	overflow: hidden;
}

.bar_progress {
	width: 100%;
	height: 100%;
	background: var(--blue);
	border-radius: 3px;

	transition: width 1s ease;
}

.bar_orange {
	height: 100%;

	background: var(--orange);

	transition: width 1s ease;
}

.bar_green {
	height: 100%;

	background: var(--green);

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

.orange_dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: var(--orange);
}

.green_dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: var(--green);
}

.mgs {
	border-top: 1px solid var(--border);

	padding-top: 20px;
	margin-top: 24px;
}
</style>
