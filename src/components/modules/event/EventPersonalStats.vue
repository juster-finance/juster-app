<script setup>
/**
 * Vendor
 */
import { computed } from "vue"

/**
 * Store
 */
import { useAccountStore } from "@store/account"

/**
 * Services
 */
import { abbreviateNumber, numberWithSymbol } from "@utils/amounts"

/**
 * UI
 */
import Tooltip from "@ui/Tooltip.vue"

const props = defineProps({
	event: {
		type: Object,
		default: {},
	},
	userDeposits: {
		type: Array,
		default: [],
	},
	userBets: {
		type: Array,
		default: [],
	},
	position: {
		type: Object,
	},
})

const accountStore = useAccountStore()

const bvl = computed(() =>
	props.userBets.reduce((acc, { amount }) => (acc += amount), 0),
)
const dvl = computed(() => {
	return props.userDeposits.reduce(
		(acc, { amountAboveEq }) => (acc += amountAboveEq),
		0,
	)
})

const returnOnBets = computed(() => {
	let reward = 0

	if (props.event.status == "FINISHED") {
		reward = props.userBets.reduce((acc, { side, reward }) => {
			return side == props.event.winnerBets ? (acc += reward) : acc
		}, 0)
	} else {
		reward = props.userBets.reduce((acc, { reward }) => (acc += reward), 0)
	}

	return reward
})

const potentialProfit = computed(() =>
	props.userBets.reduce(
		(acc, { amount, reward }) => (acc += reward - amount),
		0,
	),
)

const profitOnFinish = computed(() => {
	if (!props.position) return 0

	const liquidity = Math.max(
		props.position.liquidityProvidedAboveEq,
		props.position.liquidityProvidedBelow,
	)

	const profit = props.position.value - bvl.value - liquidity

	if (isNaN(profit)) return 0

	return profit
})

const hasHedge = computed(() => {
	const hasRiseBet = props.userBets.some((bet) => bet.side == "ABOVE_EQ")
	const hasFallBet = props.userBets.some((bet) => bet.side == "BELOW")

	return hasRiseBet && hasFallBet
})
</script>

<template>
	<div :class="$style.wrapper">
		<!-- TVL -->
		<div :class="$style.sector">
			<div :class="$style.base">
				<div :class="$style.name">TVL</div>

				<div :class="$style.amount">
					{{ abbreviateNumber(dvl + bvl) }}
					<span>ꜩ</span>
				</div>
			</div>

			<Tooltip placement="bottom-start">
				<div :class="$style.icon">
					<Icon name="wallet" size="20" />
				</div>

				<template #content> Your Stakes + Liquidity </template>
			</Tooltip>
		</div>

		<!-- Returning -->
		<div :class="$style.sector">
			<div :class="$style.base">
				<div :class="$style.name">Returning</div>

				<div
					v-if="
						['NEW', 'STARTED'].includes(event.status) &&
						dvl + bvl > 0
					"
					:class="$style.amount"
				>
					TBD
				</div>
				<div
					v-else-if="!position || !position.value"
					:class="$style.amount"
				>
					0 <span>ꜩ</span>
				</div>
				<div v-else :class="$style.amount">
					{{
						position
							? numberWithSymbol(position.value.toFixed(2), ",")
							: 0
					}}
					<span>ꜩ</span>
				</div>
			</div>

			<Tooltip placement="bottom-start">
				<div :class="$style.icon">
					<Icon name="walletadd" size="20" />
				</div>

				<template #content>
					The withdrawal amount may be different from this calculation
				</template>
			</Tooltip>
		</div>

		<!-- Profit -->
		<div :class="$style.sector">
			<div :class="$style.base">
				<div :class="$style.name">
					{{ event.status == "FINISHED" ? "Profit" : "Potential" }}
				</div>

				<div
					v-if="hasHedge && event.status !== 'FINISHED'"
					:class="$style.amount"
				>
					TBD
				</div>

				<div
					v-else-if="['NEW', 'STARTED'].includes(event.status)"
					:class="$style.amount"
				>
					{{ potentialProfit.toFixed(2) }} <span>ꜩ</span>
				</div>

				<div
					v-else-if="event.status == 'FINISHED'"
					:class="$style.amount"
				>
					{{ profitOnFinish.toFixed(2) }} <span>ꜩ</span>
				</div>

				<div v-else :class="$style.amount">0 <span>ꜩ</span></div>
			</div>

			<Tooltip
				v-if="hasHedge && event.status !== 'FINISHED'"
				placement="left-start"
				textAlign="right"
			>
				<div :class="[$style.icon, hasHedge && $style.yellow]">
					<Icon name="warning" size="20" />
				</div>

				<template #content>
					Your stakes are aimed both ways.<br />
					<span
						>The final profit will be calculated at the end of the
						event
					</span>
				</template>
			</Tooltip>
			<div
				v-else
				:class="[
					$style.icon,
					returnOnBets - bvl > 0 &&
						event.status == 'FINISHED' &&
						$style.green,
				]"
			>
				<Icon name="money" size="20" />
			</div>
		</div>
	</div>

	<Flex align="center" gap="6">
		<Icon name="help" size="14" color="tertiary" />
		<Flex>
			<Text size="12" height="16" weight="500" color="tertiary">
				<b>Returning & Profit</b> is depends on the current winning
				side.
			</Text>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	display: flex;
	align-items: center;
	gap: 18px;

	border-radius: 8px;
	background: var(--card-bg);

	padding: 0 20px;
}

.sector {
	display: flex;
	align-items: center;
	justify-content: space-between;

	height: 84px;

	flex: 1;
}

.sector:nth-child(1),
.sector:nth-child(2) {
	border-right: 2px solid rgba(0, 0, 0, 0.15);
	padding-right: 18px;
}

.base {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.name {
	font-size: 13px;
	line-height: 1.1;
	font-weight: 600;
	color: var(--text-tertiary);
}

.amount {
	font-size: 20px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-primary);
}

.amount span {
	font-weight: 500;
	font-size: 16px;
	color: var(--text-tertiary);
}

.icon {
	width: 44px;
	height: 44px;

	display: flex;
	align-items: center;
	justify-content: center;

	border-radius: 12px;
	border: 2px solid var(--border);
	fill: var(--text-secondary);
}

.icon.green {
	background: rgba(26, 161, 104, 0.15);
	fill: var(--green);
}

.icon.yellow {
	background: rgba(245, 183, 43, 0.15);
	fill: var(--yellow);
}

@media (max-width: 650px) {
	.wrapper {
		flex-direction: column;

		padding: 20px 0;
	}

	.sector {
		width: 100%;

		padding: 0 20px;
	}

	.sector:nth-child(1),
	.sector:nth-child(2) {
		border-right: initial;
		border-bottom: 1px solid var(--border);
		padding-bottom: 20px;
	}
}
</style>
