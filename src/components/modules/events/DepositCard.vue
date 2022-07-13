<script setup>
import { ref, computed } from "vue"
import { DateTime } from "luxon"

/**
 * Modals
 */
import OperationModal from "@/components/local/modals/OperationModal"

/**
 * Services
 */
import { currentNetwork } from "@/services/sdk"
import { verifiedMakers } from "@/services/config"
import { numberWithSymbol } from "@/services/utils/amounts"

/**
 * Store
 */
import { useAccountStore } from "@/store/account"

const accountStore = useAccountStore()

const props = defineProps({
	deposit: { type: Object, default: () => {} },
	event: { type: Object, default: () => {} },
})

const showOperationModal = ref(false)

const aboveEqProfit = computed(() => {
	let profit =
		(props.event.poolBelow * props.deposit.shares) /
			props.event.totalLiquidityShares -
		props.deposit.amountAboveEq

	if (profit > 0) {
		profit = profit * (1 - 0.01)
	}

	return profit
})
const belowProfit = computed(() => {
	let profit =
		(props.event.poolAboveEq * props.deposit.shares) /
			props.event.totalLiquidityShares -
		props.deposit.amountBelow

	if (profit > 0) {
		profit = profit * (1 - 0.01)
	}

	return profit
})

const returnForLiquidity = computed(() => {
	if (props.event.winnerBets == "ABOVE_EQ")
		return aboveEqProfit.value + props.deposit.amountAboveEq
	if (props.event.winnerBets == "BELOW")
		return belowProfit.value + props.deposit.amountBelow

	return 0
})
</script>

<template>
	<div @click="showOperationModal = true" :class="$style.wrapper">
		<OperationModal
			:show="showOperationModal"
			:data="deposit"
			@onClose="showOperationModal = false"
		/>

		<div :class="$style.base">
			<div :class="$style.icon">
				<Icon
					v-if="
						!verifiedMakers[currentNetwork].includes(deposit.userId)
					"
					name="liquidity"
					size="16"
				/>
				<Icon
					v-else
					name="server"
					size="16"
					:class="$style.logo_icon"
				/>

				<router-link
					:to="`/profile/${deposit.userId}`"
					:class="$style.user_avatar"
				>
					<img
						v-if="
							!verifiedMakers[currentNetwork].includes(
								deposit.userId,
							)
						"
						:src="`https://services.tzkt.io/v1/avatars/${deposit.userId}`"
						alt="avatar"
					/>
				</router-link>
			</div>

			<div :class="$style.info">
				<div
					v-if="
						!verifiedMakers[currentNetwork].includes(deposit.userId)
					"
					:class="$style.title"
				>
					{{ accountStore.pkh == deposit.userId ? "My" : "" }}
					Liquidity
				</div>
				<div v-else :class="$style.title">Liquidity Pool</div>

				<div :class="$style.time">
					{{
						DateTime.fromISO(deposit.createdTime, {
							locale: "en",
						}).toRelative()
					}}
				</div>
			</div>
		</div>

		<!-- Desktop Template -->
		<div :class="$style.desktop">
			<div :class="[$style.param, $style.up]">
				<Icon name="higher" size="12" />{{
					numberWithSymbol(deposit.amountAboveEq.toFixed(0), ",")
				}}&nbsp;<span>ꜩ</span>
			</div>

			<div :class="[$style.param, $style.down]">
				<Icon name="higher" size="12" />{{
					numberWithSymbol(deposit.amountBelow.toFixed(0), ",")
				}}&nbsp;<span>ꜩ</span>
			</div>

			<div
				v-if="event.status == 'FINISHED' && returnForLiquidity"
				:class="[$style.param]"
			>
				{{ numberWithSymbol(returnForLiquidity, ",") }}&nbsp;<span
					>ꜩ</span
				>
			</div>
			<div v-else-if="event.status == 'CANCELED'" :class="$style.param">
				Refund
			</div>
			<div v-else :class="$style.param">
				<span>TBD</span>
			</div>
		</div>

		<!-- Mobile Template -->
		<div :class="$style.mobile">
			<div :class="[$style.param, $style.up]">
				<div :class="$style.key">Rise</div>

				<div :class="$style.value">
					<Icon name="higher" size="12" />{{
						numberWithSymbol(deposit.amountAboveEq.toFixed(0), ",")
					}}&nbsp;<span>ꜩ</span>
				</div>
			</div>

			<div :class="[$style.param, $style.down]">
				<div :class="$style.key">Rise</div>

				<div :class="$style.value">
					<Icon name="higher" size="12" />{{
						numberWithSymbol(deposit.amountBelow.toFixed(0), ",")
					}}&nbsp;<span>ꜩ</span>
				</div>
			</div>

			<div
				v-if="event.status == 'FINISHED' && returnForLiquidity"
				:class="[$style.param]"
			>
				<div :class="$style.key">Return</div>

				<div :class="$style.value">
					{{ numberWithSymbol(returnForLiquidity, ",") }}&nbsp;<span
						>ꜩ</span
					>
				</div>
			</div>
			<div v-else-if="event.status == 'CANCELED'" :class="$style.param">
				<div :class="$style.key">Return</div>

				Refund
			</div>
			<div v-else :class="$style.param">
				<div :class="$style.key">Return</div>

				<span>TBD</span>
			</div>
		</div>
	</div>
</template>

<style module>
.wrapper {
	display: flex;
	align-items: center;

	height: 60px;
	border-radius: 8px;
	border: 1px solid var(--border);
	background: var(--card-bg);
	padding: 0 16px;
	cursor: pointer;

	transition: border 0.2s ease;
}

.wrapper:hover {
	border: 1px solid var(--border-highlight);
}

.base {
	display: flex;
	align-items: center;
	flex: 2;
}

.icon {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;

	width: 32px;
	height: 32px;
	border-radius: 8px;
	background: var(--opacity-05);
	fill: var(--icon);

	margin-right: 16px;
}

.user_avatar img {
	position: absolute;
	top: -8px;
	right: -8px;

	width: 20px;
	height: 20px;
	background: var(--card-bg);
	border-radius: 50%;
}

.logo_icon {
	fill: var(--brand);
}

.info {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.title {
	font-size: 14px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-primary);
}

.time {
	font-size: 12px;
	line-height: 1;
	font-weight: 500;
	color: var(--text-tertiary);
}

.param {
	display: flex;
	align-items: center;

	font-size: 14px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-primary);

	flex: 1;
}

.param.up {
	fill: var(--green);
}

.param.down {
	fill: var(--red);
}

.param.down svg {
	transform: rotate(180deg);
}

.param svg {
	margin-right: 6px;
}

.param span {
	color: var(--text-tertiary);
}

.desktop {
	display: flex;
	align-items: center;
	flex: 3;
}

.mobile {
	display: none;

	flex-direction: column;
	gap: 20px;

	width: 100%;
}

.key {
	color: var(--text-tertiary);
}

.value {
	display: flex;
	align-items: center;
}

@media (max-width: 650px) {
	.wrapper {
		align-items: flex-start;
		flex-direction: column;

		padding: 16px;
		height: initial;
	}

	.desktop {
		display: none;
	}

	.mobile {
		display: flex;
	}

	.base {
		margin-bottom: 24px;
	}

	.param {
		justify-content: space-between;
	}
}
</style>
