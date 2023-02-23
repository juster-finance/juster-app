<script setup>
/**
 * Vendor
 */
import { computed } from "vue"

/**
 * UI
 */
import Button from "@ui/Button.vue"
import LoadingBar from "@ui/LoadingBar.vue"

/**
 * Services
 */
import { f, numberWithSymbol } from "@utils/amounts"

/**
 * Store
 */
import { useAccountStore } from "@store/account"

const accountStore = useAccountStore()

const props = defineProps({
	primary: Boolean,
	event: Object,
	isWon: Boolean,
	positionForWithdraw: Object,
	disabled: Boolean,
	isWithdrawing: Boolean,
	isInvolved: Boolean,
	large: {
		type: Boolean,
		default: false,
	},
})
const emit = defineEmits(["onBet", "onWithdraw"])

const handleWithdraw = () => {
	if (isWithdrawDisabled.value) return
	emit("onWithdraw")
}

const isWithdrawDisabled = computed(
	() =>
		props.isWithdrawing ||
		!props.isWon ||
		(props.isWon && !props.positionForWithdraw) ||
		!!successfulWithdrawal.value?.amount ||
		accountStore.pendingTransaction.awaiting,
)

const ratio = computed(() => {
	if (!props.event.poolBelow || !props.event.poolAboveEq) return 0

	return {
		rise: props.event.poolBelow / props.event.poolAboveEq,
		fall: props.event.poolAboveEq / props.event.poolBelow,
	}
})

const successfulWithdrawal = computed(() => accountStore.withdrawals.find((withdrawal) => withdrawal.event.id == props.event.id))

const btnType = computed(() => {
	if (props.isWithdrawing || accountStore.pendingTransaction.awaiting) {
		return "secondary"
	}

	if (props.isWon && props.positionForWithdraw) {
		return "success"
	} else {
		return "secondary"
	}
})

const isFinished = computed(() => {
	return props.event.status === "FINISHED" || props.event.status === "CANCELED"
})
</script>

<template>
	<Flex align="center" :class="$style.wrapper">
		<template v-if="large && !isWon && !positionForWithdraw && !successfulWithdrawal && !isFinished">
			<Flex gap="4" wide :class="[disabled && $style.disabled_btns, !parseFloat(accountStore.balance) && $style.disabled_btns]">
				<Button
					@click="emit('onBet', 'Rise')"
					type="primary"
					size="medium"
					keybind="R"
					@onKeybind="emit('onBet', 'Rise')"
					block
					style="border-radius: 7px 4px 4px 7px"
				>
					<Icon name="higher" size="16" />
					Rise
				</Button>
				<Button
					@click="emit('onBet', 'Fall')"
					type="primary"
					size="medium"
					keybind="F"
					@onKeybind="emit('onBet', 'Fall')"
					block
					style="border-radius: 4px 7px 7px 4px"
				>
					<Icon name="lower" size="16" />
					Fall
				</Button>
			</Flex>
		</template>

		<template v-else-if="!large && !isWon && !positionForWithdraw && !successfulWithdrawal && !isFinished">
			<div
				@click.prevent="emit('onBet', 'Rise')"
				:class="[
					$style.action,
					primary && $style.primary,
					disabled && $style.disabled,
					!parseFloat(accountStore.balance) && $style.disabled,
				]"
			>
				<div :class="$style.left">
					<Icon name="higher" size="14" :class="$style.higher_icon" />

					<span>Rise</span>
				</div>

				<div :class="$style.ratio">
					<span v-if="ratio.rise"> x{{ (1 + ratio.rise).toFixed(2) }} </span>
					<span v-else>0.00</span>
				</div>
			</div>

			<div :class="$style.divider" />

			<div
				@click.prevent="emit('onBet', 'Fall')"
				:class="[
					$style.action,
					primary && $style.primary,
					disabled && $style.disabled,
					!parseFloat(accountStore.balance) && $style.disabled,
				]"
			>
				<div :class="$style.ratio">
					<span v-if="ratio.fall"> {{ (1 + ratio.fall).toFixed(2) }}x </span>
					<span v-else>0.00</span>
				</div>

				<div :class="$style.left">
					<span>Fall</span>

					<Icon name="lower" size="14" :class="$style.lower_icon" />
				</div>
			</div>
		</template>

		<Button v-else @click.prevent="handleWithdraw" :type="btnType" size="small" :disabled="isWithdrawDisabled" block>
			<template v-if="successfulWithdrawal">Successfully withdrawn {{ successfulWithdrawal?.amount.toFixed(2) }} XTZ</template>

			<template v-else-if="accountStore.pendingTransaction.awaiting"> Can`t withdraw right now </template>

			<template v-else-if="!isWithdrawing && positionForWithdraw">
				<Icon name="coins" size="16" />Withdraw {{ numberWithSymbol(positionForWithdraw.value, ",") }} XTZ
			</template>

			<template v-else-if="!isWon && isInvolved">No funds to withdraw</template>
			<template v-else-if="!isWon && !isInvolved">Event is successfuly finished</template>

			<template v-else> <LoadingBar /></template>
		</Button>
	</Flex>
</template>

<style module>
.wrapper {
	width: 100%;

	border-radius: 6px;
	overflow: hidden;
}

.action {
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex: 1;

	background: rgba(255, 255, 255, 0.08);

	padding: 0 12px;
	height: 32px;

	transition: background 0.2s ease;
}

.action.primary {
	background: #285dbf;
}

.action.disabled {
	background: var(--opacity-05);
	pointer-events: none;
	opacity: 0.5;
}

.action:hover {
	background: rgba(255, 255, 255, 0.12);
}

.action.primary:hover {
	background: #1f4fa8;
}

.left {
	display: flex;
	align-items: center;
	gap: 6px;
}

.left span {
	font-size: 12px;
	line-height: 14px;
	font-weight: 600;
	color: var(--text-primary);
}

.action .higher_icon {
	fill: var(--green);
}

.action .lower_icon {
	fill: var(--orange);
}

.action.primary .higher_icon {
	fill: var(--text-secondary);
}

.action.primary .lower_icon {
	fill: var(--text-secondary);
}

.action .ratio {
	display: flex;
	align-items: center;
	gap: 1px;

	font-size: 11px;
	line-height: 1.1;
	font-weight: 600;
	color: var(--text-tertiary);
}

.disabled_btns {
	opacity: 0.5;
	pointer-events: none;
}

.divider {
	height: 100%;
	width: 1px;

	background: rgba(0, 0, 0, 0.4);
}

.withdraw {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;

	font-size: 12px;
	line-height: 1.1;
	font-weight: 600;

	border-radius: 6px;
	background: var(--green);

	width: 100%;
	height: 32px;
}
</style>
