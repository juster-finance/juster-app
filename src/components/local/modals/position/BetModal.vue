<script setup>
import { ref, reactive, computed, watch, nextTick, inject } from "vue"
import BigNumber from "bignumber.js"
import { estimateFeeMultiplier } from "@juster-finance/sdk"
import { DateTime } from "luxon"

/**
 * Services
 */
import { juster, analytics, currentNetwork } from "@sdk"
import { verifiedMakers } from "@config"
import { flags, updateFlag } from "@/services/flags"
import { sanitizeInput } from "@/services/utils/global"

/**
 * Constants
 */
import { Networks } from "@/services/constants"

/**
 * Local
 */
import SplittedPool from "@local/SplittedPool.vue"
import SlippageSelector from "@local/SlippageSelector.vue"

import PositionDirection from "./PositionDirection.vue"

/**
 * UI
 */
import Spin from "@ui/Spin.vue"
import Modal from "@ui/Modal.vue"
import Input from "@ui/Input.vue"
import Button from "@ui/Button.vue"
import Banner from "@ui/Banner.vue"
import Block from "@ui/Block.vue"

/**
 * Store
 */
import { useNotificationsStore } from "@store/notifications"
import { useAppStore } from "@store/app"
import { useAccountStore } from "@store/account"
import { useApplicationCacheStore } from "@store/cache"

/**
 * Composable
 */
import { useCountdown } from "@/composable/date"

const props = defineProps({
	show: Boolean,
	event: Object,
	cache: { type: Object, default: null },
})

const emit = defineEmits(["onClose", "onBet", "onContinue"])

const appStore = useAppStore()
const accountStore = useAccountStore()
const cacheStore = useApplicationCacheStore()
const notificationsStore = useNotificationsStore()

const amountInput = ref(null)

/** Countdown setup */
const eventStartTime = computed(() =>
	new Date(props.event?.betsCloseTime).getTime(),
)
const {
	countdownText,
	status: countdownStatus,
	stop,
} = useCountdown(eventStartTime)

/** User inputs */
const side = ref(props.preselectedSide)
const amount = reactive({ value: 0, error: "" })
const slippage = ref(2.5)

const handleAmountInput = () => {
	if (amount.value) {
		cacheStore.submissions.amount = amount.value
	}
}

const handleKeydown = (e) => {
	sanitizeInput(e)
}

const sendingBet = ref(false)

/**
 * Ratio
 */
const ratio = computed(() => {
	return {
		rise: props.event.poolBelow / (props.event.poolAboveEq + amount.value),
		fall: props.event.poolAboveEq / (props.event.poolBelow + amount.value),
	}
})
const ratioBeforeBet = computed(() => {
	return {
		rise: props.event.poolBelow / props.event.poolAboveEq,
		fall: props.event.poolAboveEq / props.event.poolBelow,
	}
})
const ratioAfterBet = computed(
	() =>
		(side.value == "Rise" &&
			(props.event.poolBelow - winDelta.value) /
				(props.event.poolAboveEq + amount.value)) ||
		(side.value == "Fall" &&
			(props.event.poolAboveEq - winDelta.value) /
				(props.event.poolBelow + amount.value)),
)

const fee = computed(() =>
	estimateFeeMultiplier(
		{
			betsCloseTime: new Date(props.event.betsCloseTime),
			createdTime: new Date(props.event.createdTime),
			liquidityPercent: props.event.liquidityPercent,
		},
		new Date(),
	),
)

/** Reward */
const winDelta = computed(() => {
	const selectedRatio =
		side.value == "Rise" ? ratio.value.rise : ratio.value.fall

	return amount.value * selectedRatio * (1 - fee.value)
})
const reward = computed(() => winDelta.value + amount.value)
const minReward = computed(
	() => winDelta.value * (1 - slippage.value / 100) + amount.value,
)

// eslint-disable-next-line vue/return-in-computed-property
const rewardText = computed(() => {
	if (!amount.value) {
		return 0
	}

	if (amount.value) {
		if (minReward.value == reward.value) {
			return reward.value.toFixed(2)
		} else {
			return `${minReward.value.toFixed(2)} - ${reward.value.toFixed(2)}`
		}
	}
})

const selectTab = (tab) => {
	side.value = tab
}

const onKeydown = (e) => {
	if (e.code == "Enter") {
		e.preventDefault()
		handleBet()
	}
}

watch(
	() => props.show,
	() => {
		if (!props.show) {
			side.value = null

			amount.value = 0

			stop()

			document.removeEventListener("keydown", onKeydown)

			showHint.confirmationDelay = false
		} else {
			side.value = props.cache.side
			amount.value = props.cache.amount

			document.addEventListener("keydown", onKeydown)

			if (accountStore.isLoggined) accountStore.updateBalance()

			nextTick(() => {
				if (accountStore.isLoggined)
					amountInput.value.$el.querySelector("input").focus()
			})
		}
	},
)

watch(amount, () => {
	if (!amount.value) amount.value = ""
})

// eslint-disable-next-line vue/return-in-computed-property
const buttonState = computed(() => {
	if (accountStore.pendingTransaction.awaiting) {
		return {
			text: "Previous transaction in process",
			disabled: true,
		}
	}

	if (!side.value) {
		return { text: "Select your submission", disabled: true }
	}

	if (countdownStatus.value !== "In progress")
		return { text: "Acceptance of bets is closed", disabled: true }
	if (sendingBet.value)
		return { text: "Awaiting confirmation..", disabled: true }

	if (amount.value > accountStore.balance)
		return { text: "Insufficient funds", disabled: true }

	switch (side.value) {
		case "Rise":
		case "Fall":
			if (!amount.value)
				return { text: "Select the bet amount", disabled: true }
			if (amount.value)
				return {
					text: "Continue to confirmation",
					disabled: false,
				}
	}
})

const showHint = reactive({
	confirmationDelay: false,
})

const handleBet = () => {
	emit("onContinue")
	// if (buttonState.value.disabled) return
	// let betType
	// if (side.value == "Rise") betType = "aboveEq"
	// if (side.value == "Fall") betType = "below"
	// sendingBet.value = true
	// setTimeout(() => {
	// 	showHint.confirmationDelay = true
	// }, 5000)
	// juster.sdk
	// 	.bet(
	// 		event.value.id,
	// 		betType,
	// 		BigNumber(amount.value),
	// 		BigNumber(minReward.value),
	// 	)
	// 	.then((op) => {
	// 		/** Pending transaction label */
	// 		accountStore.pendingTransaction.awaiting = true
	// 		op.confirmation()
	// 			.then((result) => {
	// 				accountStore.pendingTransaction.awaiting = false
	// 				if (!result.completed) {
	// 					// todo: handle it?
	// 				}
	// 			})
	// 			.catch(() => {
	// 				accountStore.pendingTransaction.awaiting = false
	// 			})
	// 		sendingBet.value = false
	// 		showHint.confirmationDelay = false
	// 		/** slow notification to get attention */
	// 		setTimeout(() => {
	// 			notificationsStore.create({
	// 				notification: {
	// 					type: "success",
	// 					title: "Your bet has been accepted",
	// 					description:
	// 						"We need to process your bet, it will take 15-30 seconds",
	// 					autoDestroy: true,
	// 				},
	// 			})
	// 		}, 700)
	// 		/** analytics */
	// 		analytics.log("onBet", {
	// 			eventId: event.value.id,
	// 			amount: amount.value,
	// 			fm: fee.value.toNumber(),
	// 			tts:
	// 				DateTime.fromISO(event.value.betsCloseTime).ts -
	// 				DateTime.now().ts,
	// 		})
	// 		context.emit("onBet", {
	// 			side: betType == "aboveEq" ? "ABOVE_EQ" : "BELOW",
	// 			amount: amount.value,
	// 			reward: minReward.value,
	// 		})
	// 	})
	// 	.catch((err) => {
	// 		/** analytics */
	// 		analytics.log("onError", {
	// 			eventId: event.value.id,
	// 			error: err.description,
	// 		})
	// 		/** slow notification to get attention */
	// 		setTimeout(() => {
	// 			notificationsStore.create({
	// 				notification: {
	// 					type: "warning",
	// 					title: "Your bet was not accepted",
	// 					description: err.description,
	// 					autoDestroy: true,
	// 				},
	// 			})
	// 		}, 700)
	// 		sendingBet.value = false
	// 		showHint.confirmationDelay = false
	// 	})
}

/** Login */
const handleLogin = async () => {
	await juster.sdk.sync()
	juster.sdk.getPkh().then((pkh) => {
		accountStore.setPkh(pkh)
	})

	emit("onClose")
}

const handleCloseTestnetWarning = () => {
	updateFlag("showTestnetWarningInStakeModal", false)

	notificationsStore.create({
		notification: {
			type: "success",
			title: "Testnet Warning is now hidden",
			autoDestroy: true,

			actions: [
				{
					name: "Undo",
					icon: "back",
					callback: () => {
						updateFlag("showTestnetWarningInStakeModal", true)
					},
				},
			],
		},
	})
}

const handleClose = () => {
	if (!appStore.confirmation.show && amount.value) {
		appStore.confirmation.title = "Discard stake?"
		appStore.confirmation.description =
			"After closing the selected direction, amount and event is reset"
		appStore.confirmation.show = true
		appStore.confirmation.callback = () => {
			appStore.confirmation.show = false
			emit("onClose")
		}
	} else {
		emit("onClose")
	}
}
</script>

<template>
	<Modal
		:show="show"
		width="500"
		closable
		:block-closing="appStore.confirmation.show"
		@onClose="handleClose"
	>
		<template v-if="accountStore.isLoggined">
			<div :class="$style.title">Stake</div>

			<Block
				v-if="
					flags.showTestnetWarningInStakeModal &&
					currentNetwork === Networks.TESTNET
				"
				@onClose="handleCloseTestnetWarning"
				:class="$style.banner"
			>
				<span>This stake is for the test network.</span> Use it to test
				tools or to understand how to interact with product.
			</Block>

			<PositionDirection
				:event="event"
				:amount="amount"
				:countdown="countdownText"
				:class="$style.direction"
			/>

			<div :class="$style.subtitle">The price will</div>

			<div :class="$style.tabs">
				<div
					@click="selectTab('Rise')"
					:class="[$style.tab, side == 'Rise' && $style.higher]"
				>
					<div :class="$style.tab_left">
						<Icon name="arrow_circle_top_right" size="16" />Rise
					</div>
					<div :class="$style.tab_ratio">
						<Icon name="close" size="10" />
						{{ (1 + ratioBeforeBet.rise).toFixed(2) }}
					</div>
				</div>
				<div
					@click="selectTab('Fall')"
					:class="[$style.tab, side == 'Fall' && $style.lower]"
				>
					<div :class="$style.tab_ratio">
						<Icon name="close" size="10" />
						{{ (1 + ratioBeforeBet.fall).toFixed(2) }}
					</div>

					<div :class="$style.tab_left">
						Fall
						<Icon name="arrow_circle_bottom_right" size="16" />
					</div>
				</div>
			</div>

			<Input
				ref="amountInput"
				type="number"
				:limit="10000"
				label="Amount"
				placeholder="Bet amount"
				subtext="ꜩ"
				v-model="amount.value"
				@input="handleAmountInput"
				@keydown="handleKeydown"
				:class="$style.amount_input"
			>
				<template v-slot:rightText>
					<div :class="$style.potential_reward">
						Payout:
						<span>{{ rewardText }}</span> ꜩ
					</div>
				</template>
			</Input>

			<SplittedPool
				:event="event"
				:amount="amount.value"
				:win-delta="winDelta"
				:side="side"
				:class="$style.pool"
			/>

			<SlippageSelector
				v-model="slippage"
				:class="$style.slippage_block"
			/>

			<Banner
				v-if="!verifiedMakers[currentNetwork].includes(event.creatorId)"
				icon="warning"
				color="yellow"
				size="small"
				:class="$style.banner"
			>
				This event is Custom, its behavior may depend on the parameters
			</Banner>

			<Button
				@click="handleBet"
				size="large"
				:type="buttonState.disabled ? 'secondary' : 'primary'"
				block
				:loading="sendingBet"
				:disabled="buttonState.disabled"
			>
				{{ buttonState.text }}
				<Spin v-if="sendingBet" size="16" />
				<Icon
					v-else
					:name="!buttonState.disabled ? 'arrowright' : 'lock'"
					size="16"
				/>
			</Button>

			<div v-if="showHint.confirmationDelay" :class="$style.hint">
				Confirmation not appearing?
				<a
					href="https://juster.notion.site/Transaction-confirmation-is-not-received-for-a-long-time-18f589e67d8943f9bf5627a066769c92"
					target="_blank"
					>Read about possible solutions</a
				>
			</div>
		</template>

		<template v-else>
			<div :class="$style.title">Place a bet</div>
			<div :class="$style.description">
				You need to connect your wallet (with Beacon) to place liquidity
				and make bets
			</div>

			<Flex direction="column" gap="16">
				<Button @click="handleLogin" size="large" type="primary" block>
					<Icon name="login" size="16" />Continue to Beacon Wallet
				</Button>
				<router-link to="/connect">
					<Button size="large" type="secondary" block>
						<Icon name="login" size="16" />Go to Connect Wallet
					</Button>
				</router-link>
			</Flex>
		</template>
	</Modal>
</template>

<style module>
.title {
	font-size: 20px;
	font-weight: 600;
	line-height: 1.2;
	color: var(--text-primary);

	margin-bottom: 24px;
}

.direction {
	margin-bottom: 32px;
}

.description {
	font-size: 14px;
	line-height: 1.6;
	font-weight: 500;
	color: var(--text-tertiary);

	margin-bottom: 24px;
}

.subtitle {
	font-size: 14px;
	font-weight: 600;
	color: var(--text-secondary);

	margin-bottom: 12px;
}

.tabs {
	display: flex;
	justify-content: space-between;
	gap: 8px;

	margin-bottom: 24px;
}

.tab {
	display: flex;
	justify-content: space-between;
	align-items: center;

	font-size: 14px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-primary);

	background: var(--opacity-05);
	border-radius: 8px;
	width: 100%;
	height: 40px;
	padding: 14px;

	transition: all 0.15s ease;
}

.tab:hover {
	background: var(--opacity-03);
}

.tab_left {
	display: flex;
	align-items: center;
	gap: 6px;
}

.tab_ratio {
	display: flex;
	align-items: center;
	gap: 2px;

	font-size: 12px;
	line-height: 1;
	font-weight: 700;
	color: var(--text-tertiary);
	fill: var(--text-tertiary);
}

.tab_left svg {
	fill: var(--text-white);
	transition: fill 0.15s ease;
}

.tab.higher {
	background: var(--green);
	color: var(--text-black);
}

.tab.higher .tab_left svg {
	fill: var(--text-black);
}

.tab.higher .tab_ratio {
	color: rgba(0, 0, 0, 0.6);
	fill: rgba(0, 0, 0, 0.6);
}

.tab.lower {
	background: var(--orange);
	color: var(--text-black);
}

.tab.lower .tab_left svg {
	fill: var(--text-black);
}

.tab.lower .tab_ratio {
	color: rgba(0, 0, 0, 0.6);
	fill: rgba(0, 0, 0, 0.6);
}

.amount_input {
	margin-bottom: 24px;
}

.potential_reward {
	font-size: 12px;
	line-height: 1;
	font-weight: 500;
	color: var(--text-tertiary);
}

.potential_reward span {
	cursor: pointer;
	color: var(--text-secondary);
}

.pool {
	margin-bottom: 24px;
}

.slippage_block {
	margin-bottom: 24px;
}

.banner {
	margin-bottom: 24px;
}

.hint {
	font-size: 12px;
	line-height: 1;
	font-weight: 500;
	color: var(--text-tertiary);
	text-align: center;

	margin-top: 12px;
}

.hint a {
	color: var(--text-blue);
}
</style>
