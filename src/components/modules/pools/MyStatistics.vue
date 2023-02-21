<script setup>
/**
 * Vendor
 */
import { ref, reactive, computed } from "vue"
import BN from "bignumber.js"

/**
 * UI
 */
import Tooltip from "@ui/Tooltip.vue"
import Toggleable from "@ui/Toggleable.vue"

/**
 * Services
 */
import { parsePoolName } from "@utils/misc"
import { numberWithSymbol, truncate } from "@utils/amounts"

/**
 * Store
 */
import { useMarketStore } from "@store/market"

const marketStore = useMarketStore()

const props = defineProps({
	positions: Array,
	poolsAPY: Object,
	poolsStates: Object,
	summaries: Object,
	isReady: Boolean,
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

const valueLocked = computed(() => {
	if (!props.isReady) return 0
	return props.positions
		.reduce((acc, curr) => {
			return acc.plus(curr.shares.multipliedBy(props.poolsStates[curr.poolId].sharePrice))
		}, BN(0))
		.toNumber()
})

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

const sortedPositions = computed(() => {
	const sPositions = props.positions.map((position) => {
		return {
			...position,
			tvl: position.shares.multipliedBy(props.poolsStates[position.poolId].sharePrice),
		}
	})

	return sPositions.sort((a, b) => b.tvl - a.tvl)
})

const sortedSummaries = computed(() => {
	let sums = Object.keys(props.summaries).map((pool) => {
		return { ...props.summaries[pool], poolId: pool }
	})

	sums = sums.filter((s) => !(s.unrealizedProfit.toNumber() + s.realizedProfit).toString().includes("e"))

	return sums.sort((a, b) => {
		const aProfit = a.realizedProfit + a.unrealizedProfit.toNumber()
		const bProfit = b.realizedProfit + b.unrealizedProfit.toNumber()

		return profit.realized + profit.unrealized < 0 ? aProfit - bProfit : bProfit - aProfit
	})
})

const parseProfitAmount = (amount) => {
	if (Math.abs(amount % 1) < 0.01 && amount !== 0 && amount < 0.01 && amount > -0.01) {
		return truncate(amount)
	} else {
		return numberWithSymbol(amount, ",")
	}
}
</script>

<template>
	<div :class="$style.wrapper">
		<Flex @click="expanded = !expanded" justify="between" :class="$style.head">
			<Flex direction="column" gap="8">
				<Text color="primary" size="16" weight="600"> My Statistics </Text>
				<Text color="tertiary" size="14" weight="500" height="14"> Explore the distribution of your funds </Text>
			</Flex>

			<Icon name="arrow" size="20" color="tertiary" :class="[$style.arrow_icon, expanded && $style.toggle]" />
		</Flex>

		<Toggleable :expanded="expanded">
			<Flex v-if="selectedTab === 'TVL'" direction="column" gap="24" :class="$style.mgs">
				<Flex v-if="!valueLocked & isReady" direction="column" gap="16" align="center" :class="$style.empty_warn">
					<Icon name="bar_chart" size="24" color="support" />

					<Text size="13" color="support" weight="500" height="16" align="center">
						After the first deposits here you will see what pools were provided with liquidity and in what amount
					</Text>
				</Flex>

				<template v-if="isReady">
					<template v-if="valueLocked">
						<Flex v-for="position in sortedPositions" direction="column" gap="8">
							<Flex align="center" justify="between">
								<Text color="secondary" size="13" weight="600">
									{{ parsePoolName(position.pool.name.replace("Juster Pool: ", "")) }}
								</Text>

								<Flex align="center" gap="8">
									<Text color="tertiary" size="13" weight="600">
										{{ ((position.tvl * 100) / valueLocked).toFixed(0) }}%
									</Text>

									<Text color="secondary" size="13" weight="600">
										{{ parseProfitAmount(position.tvl) }}
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
							</Flex>
						</Flex>
					</template>

					<Flex v-if="valueLocked" align="center" gap="16">
						<Flex align="center" gap="6">
							<div :class="$style.deposited_dot" />
							<Text size="12" weight="600" color="secondary"> Total Value Locked </Text>
						</Flex>
					</Flex>
				</template>
				<template v-else>
					<Flex direction="column" gap="8">
						<Flex align="center" justify="between">
							<Text color="secondary" size="13" weight="600"> Pools </Text>

							<Text color="tertiary" size="13" weight="600"> Loading... </Text>
						</Flex>

						<Flex :class="$style.progress_wrapper_loading"> </Flex>
					</Flex>
				</template>
			</Flex>

			<Flex v-else-if="selectedTab === 'Profit'" direction="column" gap="24" :class="$style.mgs">
				<Tooltip placement="bottom" isWide>
					<Flex direction="column" gap="8" wide>
						<Flex align="center" justify="between">
							<Text color="secondary" size="13" weight="600"> Total Profit </Text>

							<Text color="secondary" size="13" weight="600">
								{{ parseProfitAmount(profit.realized + profit.unrealized) }}
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
											width: `${(100 * profit.unrealized) / profit.total}%`,
											opacity: '0.5',
										}"
										:class="$style.bar_orange"
									/>
									<div
										:style="{
											width: `${100 - (100 * profit.unrealized) / profit.total}%`,
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
											width: `${100 - (100 * profit.unrealized) / profit.total}%`,
										}"
										:class="$style.bar_green"
									/>
									<div
										:style="{
											width: `${(100 * profit.unrealized) / profit.total}%`,
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
						<span>{{ parseProfitAmount(profit.realized) }}</span
						>, Unrealized
						<span>{{ parseProfitAmount(profit.unrealized) }}</span>
					</template>
				</Tooltip>

				<template v-if="profit.total">
					<Flex v-for="summary in sortedSummaries" direction="column" gap="8">
						<Tooltip placement="bottom" isWide>
							<Flex direction="column" gap="8" wide>
								<Flex align="center" justify="between">
									<Text color="secondary" size="13" weight="600">
										{{
											parsePoolName(pools.find((p) => p.address == summary.poolId).name.replace("Juster Pool: ", ""))
										}}
									</Text>

									<Text color="secondary" size="13" weight="600">
										{{ parseProfitAmount(summary.realizedProfit + summary.unrealizedProfit.toNumber()) }}
									</Text>
								</Flex>

								<Flex :class="$style.progress_wrapper">
									<Flex
										justify="end"
										:class="$style.left_wrapper"
										:style="{
											opacity: summary.realizedProfit + summary.unrealizedProfit.toNumber() < 0 ? 1 : 0,
										}"
									>
										<Flex
											:style="{
												width: `${Math.abs(
													(100 * (summary.realizedProfit + summary.unrealizedProfit.toNumber())) / profit.total,
												)}%`,
											}"
											:class="$style.left"
										>
											<div
												:style="{
													width: `${
														(100 * summary.unrealizedProfit.toNumber()) /
														(summary.realizedProfit + summary.unrealizedProfit.toNumber())
													}%`,
													opacity: '0.5',
												}"
												:class="$style.bar_orange"
											/>
											<div
												:style="{
													width: `${
														100 -
														(100 * summary.unrealizedProfit.toNumber()) /
															(summary.realizedProfit + summary.unrealizedProfit.toNumber())
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
											opacity: summary.realizedProfit + summary.unrealizedProfit.toNumber() > 0 ? 1 : 0,
										}"
									>
										<Flex
											:style="{
												width: `${Math.abs(
													(100 * (summary.realizedProfit + summary.unrealizedProfit.toNumber())) / profit.total,
												)}%`,
											}"
											:class="$style.right"
										>
											<div
												:style="{
													width: `${
														100 -
														(100 * summary.unrealizedProfit.toNumber()) /
															(summary.realizedProfit + summary.unrealizedProfit.toNumber())
													}%`,
												}"
												:class="$style.bar_green"
											/>
											<div
												:style="{
													width: `${
														(100 * summary.unrealizedProfit.toNumber()) /
														(summary.realizedProfit + summary.unrealizedProfit.toNumber())
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
								<span>
									{{ truncate(summary.realizedProfit) }}
								</span>
								, Unrealized
								<span>
									{{ truncate(summary.unrealizedProfit) }}
								</span>
							</template>
						</Tooltip>
					</Flex>
				</template>

				<Flex align="center" gap="16">
					<Flex align="center" gap="6">
						<div :class="$style.orange_dot" />
						<Text size="12" weight="600" color="secondary"> Realized Loss </Text>
					</Flex>
					<Flex align="center" gap="6">
						<div :class="$style.orange_dot" style="opacity: 0.5" />
						<Text size="12" weight="600" color="secondary"> Unrealized </Text>
					</Flex>

					<Flex align="center" gap="6">
						<div :class="$style.green_dot" />
						<Text size="12" weight="600" color="secondary"> Realized Profit </Text>
					</Flex>
					<Flex align="center" gap="6">
						<div :class="$style.green_dot" style="opacity: 0.5" />
						<Text size="12" weight="600" color="secondary"> Unrealized </Text>
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
					:class="[$style.tab, selectedTab === tab.title && $style.active]"
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

@keyframes mig {
	0% {
		background: rgba(255, 255, 255, 0.05);
	}
	50% {
		background: rgba(255, 255, 255, 0.15);
	}
	100% {
		background: rgba(255, 255, 255, 0.05);
	}
}
.progress_wrapper_loading {
	width: 100%;
	height: 12px;
	border-radius: 3px;
	overflow: hidden;

	animation: mig 2s infinite;
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

.tab.disabled {
	opacity: 0.5;
	pointer-events: none;
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

.empty_warn {
	padding: 32px 0;
}
</style>
