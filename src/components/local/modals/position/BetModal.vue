<script>
import { defineComponent, ref, reactive, computed, toRefs, watch, nextTick } from 'vue'
import BigNumber from 'bignumber.js'
import { estimateFeeMultiplier } from '@juster-finance/sdk'
import { DateTime } from 'luxon'

/**
 * Services
 */
import { juster, analytics, currentNetwork } from '@/services/sdk'
import { verifiedMakers } from '@/services/config'

/**
 * Local
 */
import SplittedPool from '@/components/local/SplittedPool'
import SlippageSelector from '@/components/local/SlippageSelector'

import PositionDirection from './PositionDirection'

/**
 * UI
 */
import Spin from '@/components/ui/Spin'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Banner from '@/components/ui/Banner'

/**
 * Store
 */
import { useAccountStore } from '@/store/account'
import { useNotificationsStore } from '@/store/notifications'

/**
 * Composable
 */
import { useCountdown } from '@/composable/date'

export default defineComponent({
	name: 'BetModal',
	props: {
		show: Boolean,
		event: Object,
		preselectedSide: { type: String, default: 'Rise' },
	},
	emits: ['onClose', 'onBet'],

	setup(props, context) {
		const { event, show, preselectedSide } = toRefs(props)

		const accountStore = useAccountStore()
		const notificationsStore = useNotificationsStore()

		const amountInput = ref(null)

		/** Countdown setup */
		const eventStartTime = computed(() => new Date(event.value?.betsCloseTime).getTime())
		const { countdownText, status: countdownStatus, stop } = useCountdown(eventStartTime)

		/** User inputs */
		const side = ref(preselectedSide.value)
		const amount = reactive({ value: 0, error: '' })
		const slippage = ref(2.5)

		const sendingBet = ref(false)

		/**
		 * Ratio
		 */
		const ratio = computed(() => {
			return {
				rise: event.value.poolBelow / (event.value.poolAboveEq + amount.value),
				fall: event.value.poolAboveEq / (event.value.poolBelow + amount.value),
			}
		})
		const ratioBeforeBet = computed(() => {
			return {
				rise: event.value.poolBelow / event.value.poolAboveEq,
				fall: event.value.poolAboveEq / event.value.poolBelow,
			}
		})
		const ratioAfterBet = computed(
			() =>
				(side.value == 'Rise' &&
					(event.value.poolBelow - winDelta.value) / (event.value.poolAboveEq + amount.value)) ||
				(side.value == 'Fall' &&
					(event.value.poolAboveEq - winDelta.value) / (event.value.poolBelow + amount.value))
		)

		const fee = computed(() =>
			estimateFeeMultiplier(
				{
					betsCloseTime: new Date(event.value.betsCloseTime),
					createdTime: new Date(event.value.createdTime),
					liquidityPercent: event.value.liquidityPercent,
				},
				new Date()
			)
		)

		/** Reward */
		const winDelta = computed(() => {
			const selectedRatio = side.value == 'Rise' ? ratio.value.rise : ratio.value.fall

			return amount.value * selectedRatio * (1 - fee.value)
		})
		const reward = computed(() => winDelta.value + amount.value)
		const minReward = computed(() => winDelta.value * (1 - slippage.value / 100) + amount.value)

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
			if (e.code == 'Enter') {
				e.preventDefault()
				handleBet()
			}
		}

		watch(show, () => {
			if (!show.value) {
				side.value = null

				amount.value = 0

				stop()

				document.removeEventListener('keydown', onKeydown)

				showHint.confirmationDelay = false
				showHint.aborted = false
			} else {
				side.value = preselectedSide.value

				document.addEventListener('keydown', onKeydown)

				accountStore.updateBalance()

				nextTick(() => {
					amountInput.value.$el.querySelector('input').focus()
				})
			}
		})

		watch(amount, () => {
			if (!amount.value) amount.value = ''
		})

		// eslint-disable-next-line vue/return-in-computed-property
		const buttonState = computed(() => {
			if (accountStore.pendingTransaction.awaiting) {
				return {
					text: 'Previous transaction in process',
					disabled: true,
				}
			}

			if (!side.value) {
				return { text: 'Select your submission', disabled: true }
			}

			if (countdownStatus.value !== 'In progress') return { text: 'Acceptance of bets is closed', disabled: true }
			if (sendingBet.value) return { text: 'Awaiting confirmation..', disabled: true }

			if (amount.value > accountStore.balance) return { text: 'Insufficient funds', disabled: true }

			switch (side.value) {
				case 'Rise':
				case 'Fall':
					if (!amount.value) return { text: 'Select the bet amount', disabled: true }
					if (amount.value) return { text: 'Place a bet', disabled: false }
			}
		})

		const showHint = reactive({
			confirmationDelay: false,
			aborted: false,
		})

		const handleBet = () => {
			if (buttonState.value.disabled) return

			let betType
			if (side.value == 'Rise') betType = 'aboveEq'
			if (side.value == 'Fall') betType = 'below'

			sendingBet.value = true

			setTimeout(() => {
				showHint.confirmationDelay = true
			}, 5000)

			juster.sdk
				.bet(event.value.id, betType, BigNumber(amount.value), BigNumber(minReward.value))
				.then((op) => {
					/** Pending transaction label */
					accountStore.pendingTransaction.awaiting = true

					op.confirmation()
						.then((result) => {
							accountStore.pendingTransaction.awaiting = false

							if (!result.completed) {
								// todo: handle it?
							}
						})
						.catch(() => {
							accountStore.pendingTransaction.awaiting = false
						})

					sendingBet.value = false
					showHint.confirmationDelay = false
					showHint.aborted = false

					/** slow notification to get attention */
					setTimeout(() => {
						notificationsStore.create({
							notification: {
								type: 'success',
								title: 'Your bet has been accepted',
								description: 'We need to process your bet, it will take 15-30 seconds',
								autoDestroy: true,
							},
						})
					}, 700)

					/** analytics */
					analytics.log('onBet', {
						eventId: event.value.id,
						amount: amount.value,
						fm: fee.value.toNumber(),
						tts: DateTime.fromISO(event.value.betsCloseTime).ts - DateTime.now().ts,
					})

					context.emit('onBet', {
						side: betType == 'aboveEq' ? 'ABOVE_EQ' : 'BELOW',
						amount: amount.value,
						reward: minReward.value,
					})
				})
				.catch((err) => {
					/** analytics */
					analytics.log('onError', {
						eventId: event.value.id,
						error: err.description,
					})

					if (err.title == 'Aborted') showHint.aborted = true

					/** slow notification to get attention */
					setTimeout(() => {
						notificationsStore.create({
							notification: {
								type: 'warning',
								title: 'Your bet was not accepted',
								description: err.description,
								autoDestroy: true,
							},
						})
					}, 700)

					sendingBet.value = false
					showHint.confirmationDelay = false
				})
		}

		/** Login */
		const handleLogin = async () => {
			await juster.sdk.sync()
			juster.sdk.getPkh().then((pkh) => {
				accountStore.setPkh(pkh)
			})

			context.emit('onClose')
		}

		return {
			accountStore,
			countdownText,
			countdownStatus,
			amountInput,
			selectTab,
			side,
			amount,
			slippage,
			sendingBet,
			winDelta,
			ratio,
			ratioBeforeBet,
			ratioAfterBet,
			fee,
			rewardText,
			handleBet,
			showHint,
			handleLogin,
			buttonState,
			verifiedMakers,
			currentNetwork,
		}
	},

	components: {
		Modal,
		Input,
		Button,
		Spin,
		Banner,
		SplittedPool,
		SlippageSelector,
		PositionDirection,
	},
})
</script>

<template>
	<Modal :show="show" width="500" closable @onClose="$emit('onClose')">
		<template v-if="accountStore.isLoggined">
			<div :class="$style.title">Place a bet</div>

			<Banner
				v-if="currentNetwork !== 'mainnet'"
				icon="hammer"
				color="yellow"
				size="small"
				center
				:class="$style.banner"
			>
				The transaction takes place on the Ithacanet
			</Banner>

			<PositionDirection :event="event" :amount="amount" :countdown="countdownText" :class="$style.direction" />

			<Banner
				v-if="!verifiedMakers[currentNetwork].includes(event.creatorId)"
				icon="warning"
				color="yellow"
				size="small"
				:class="$style.banner"
			>
				This event is Custom, its behavior may depend on the parameters
			</Banner>

			<div :class="$style.subtitle">The price will</div>

			<div :class="$style.tabs">
				<div @click="selectTab('Rise')" :class="[$style.tab, side == 'Rise' && $style.higher]">
					<div :class="$style.tab_left"><Icon name="higher" size="16" />Rise</div>
					<div :class="$style.tab_ratio">
						<Icon name="close" size="10" />
						{{ (1 + ratioBeforeBet.rise).toFixed(2) }}
					</div>
				</div>
				<div @click="selectTab('Fall')" :class="[$style.tab, side == 'Fall' && $style.lower]">
					<div :class="$style.tab_ratio">
						<Icon name="close" size="10" />
						{{ (1 + ratioBeforeBet.fall).toFixed(2) }}
					</div>

					<div :class="$style.tab_left">
						Fall
						<Icon name="lower" size="16" />
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
				:class="$style.amount_input"
			>
				<template v-slot:rightText>
					<div :class="$style.potential_reward">
						Reward:
						<span>{{ rewardText }}</span> ꜩ
					</div>
				</template>
			</Input>

			<SplittedPool
				:event="event"
				:amount="amount.value"
				:winDelta="winDelta"
				:side="side"
				:class="$style.pool"
			/>

			<SlippageSelector v-model="slippage" :class="$style.slippage_block" />

			<Button
				@click="handleBet"
				size="large"
				:type="buttonState.disabled ? 'secondary' : 'primary'"
				block
				:loading="sendingBet"
				:disabled="buttonState.disabled"
			>
				<Spin v-if="sendingBet" size="16" />
				<Icon v-else :name="!buttonState.disabled ? 'bolt' : 'lock'" size="16" />
				{{ buttonState.text }}
			</Button>

			<div v-if="showHint.aborted" :class="$style.hint">
				If you did not cancel the last transaction, then
				<a>reconnect</a> the wallet
			</div>
			<div v-else-if="showHint.confirmationDelay" :class="$style.hint">
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
				You need to connect your wallet (with Beacon) to place liquidity and make bets
			</div>

			<Button @click="handleLogin" size="large" type="primary" block>
				<Icon name="login" size="16" />Sign in to continue
			</Button>
		</template>
	</Modal>
</template>

<style module>
.wrapper {
}

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

	background: var(--btn-secondary-bg);
	border-radius: 8px;
	width: 100%;
	height: 40px;
	padding: 14px;

	transition: all 0.15s ease;
}

.tab:hover {
	background: var(--btn-secondary-bg-hover);
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
