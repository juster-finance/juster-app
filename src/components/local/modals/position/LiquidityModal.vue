<script>
import { defineComponent, ref, reactive, computed, toRefs, watch, nextTick } from 'vue'
import BigNumber from 'bignumber.js'
import { DateTime } from 'luxon'

/**
 * Services
 */
import { juster, currentNetwork, analytics } from '@/services/sdk'
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
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Stat from '@/components/ui/Stat'
import Button from '@/components/ui/Button'
import Spin from '@/components/ui/Spin'
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
	name: 'LiquidityModal',
	props: { show: Boolean, event: Object },
	emits: ['onClose'],

	setup(props, context) {
		const { event, show } = toRefs(props)

		const accountStore = useAccountStore()
		const notificationsStore = useNotificationsStore()

		const amountInput = ref(null)

		/** Countdown setup */
		const eventStartTime = computed(() => new Date(event.value?.betsCloseTime).getTime())
		const { countdownText, status: countdownStatus, stop } = useCountdown(eventStartTime)

		/** User inputs */
		const amount = reactive({ value: 0, error: '' })
		const slippage = ref(2.5)

		const sendingLiquidity = ref(false)

		const liquidityRatio = computed(() => {
			const abRatio = event.value.poolBelow / event.value.poolAboveEq
			const slippageMultiplier = 1 + slippage.value / 100

			return {
				min: abRatio / slippageMultiplier,
				max: abRatio * slippageMultiplier,
			}
		})
		const shares = computed(() => {
			const bigPool = Math.max(event.value.poolBelow, event.value.poolAboveEq)

			return (event.value.totalLiquidityShares * (!amount.value ? 0 : amount.value)) / bigPool
		})

		const onKeydown = (e) => {
			if (e.code == 'Enter') {
				e.preventDefault()
				handleProvideLiquidity()
			}
		}

		watch(show, () => {
			if (!show.value) {
				amount.value = 0
				sendingLiquidity.value = false

				stop()

				document.removeEventListener('keydown', onKeydown)

				showHint.confirmationDelay = false
				showHint.aborted = false
			} else {
				accountStore.updateBalance()

				document.addEventListener('keydown', onKeydown)

				/** auto-focus input */
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

			if (countdownStatus.value !== 'In progress') return { text: 'Acceptance of bets is closed', disabled: true }
			if (sendingLiquidity.value) return { text: 'Awaiting confirmation..', disabled: true }

			if (amount.value > accountStore.balance) return { text: 'Insufficient funds', disabled: true }

			if (!amount.value) return { text: 'Select the liquidity amount', disabled: true }
			if (amount.value) return { text: 'Provide liquidity', disabled: false }
		})

		const showHint = reactive({
			confirmationDelay: false,
			aborted: false,
		})

		const handleProvideLiquidity = () => {
			if (buttonState.value.disabled) return

			sendingLiquidity.value = true

			setTimeout(() => {
				showHint.confirmationDelay = true
			}, 5000)

			juster.sdk
				.provideLiquidity(
					event.value.id,
					new BigNumber(event.value.poolAboveEq),
					new BigNumber(event.value.poolBelow),
					new BigNumber(slippage.value / 100),
					new BigNumber(amount.value)
				)
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
						.catch((err) => {
							accountStore.pendingTransaction.awaiting = false
						})

					sendingLiquidity.value = false
					showHint.confirmationDelay = false
					showHint.aborted = false

					/** slow notification to get attention */
					setTimeout(() => {
						notificationsStore.create({
							notification: {
								type: 'success',
								title: 'Your liquidity has been accepted',
								description: 'We need to process your bet, it will take 15-30 seconds',
								autoDestroy: true,
							},
						})
					}, 700)

					/** analytics */
					analytics.log('onLiquidity', {
						eventId: event.value.id,
						amount: amount.value,
						tts: DateTime.fromISO(event.value.betsCloseTime).ts - DateTime.now().ts,
					})

					context.emit('onClose')
				})
				.catch((err) => {
					sendingLiquidity.value = false
					showHint.confirmationDelay = false

					if (err.title == 'Aborted') showHint.aborted = true
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
			amount,
			slippage,
			sendingLiquidity,
			liquidityRatio,
			shares,
			showHint,
			handleProvideLiquidity,
			handleLogin,
			buttonState,
			verifiedMakers,
			currentNetwork,
		}
	},

	emits: ['onClose'],
	components: {
		Modal,
		Input,
		Stat,
		Button,
		Spin,
		Banner,
		PositionDirection,
		SplittedPool,
		SlippageSelector,
	},
})
</script>

<template>
	<Modal :show="show" width="500" closable @onClose="$emit('onClose')">
		<template v-if="accountStore.isLoggined">
			<div :class="$style.title">Providing liquidity</div>

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

			<Input
				ref="amountInput"
				type="number"
				:limit="10000"
				label="Amount"
				placeholder="Liquidity amount"
				subtext="ꜩ"
				v-model="amount.value"
				:error="amount.error"
				@clearError="amount.error = ''"
				:class="$style.amount_input"
			/>

			<SplittedPool :event="event" :amount="amount.value" side="Liquidity" :class="$style.pool" />

			<SlippageSelector v-model="slippage" :class="$style.slippage_block" />

			<div :class="$style.stats">
				<Stat name="Reward for providing">{{ (event.liquidityPercent * 100).toFixed(0) }}%</Stat>

				<Stat v-if="liquidityRatio" name="Ratio">
					<Icon name="close" size="14" :class="$style.ratio_icon" />
					{{ (1 + liquidityRatio.min).toFixed(2) }} -
					{{ (1 + liquidityRatio.max).toFixed(2) }}
				</Stat>
			</div>

			<Banner
				v-if="!verifiedMakers[currentNetwork].includes(event.creatorId)"
				icon="warning"
				color="red"
				size="small"
				:class="$style.banner"
			>
				This event is Custom, its behavior may depend on the parameters
			</Banner>

			<Button
				@click="handleProvideLiquidity"
				size="large"
				:type="buttonState.disabled ? 'secondary' : 'primary'"
				block
				:loading="sendingLiquidity"
				:disabled="buttonState.disabled"
			>
				<Spin v-if="sendingLiquidity" size="16" />
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
			<div :class="$style.title">Providing liquidity</div>
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

.amount_input {
	margin-bottom: 24px;
}

.pool {
	margin-bottom: 24px;
}

.stats {
	display: flex;
	flex-direction: column;
	gap: 8px;

	margin-bottom: 24px;
}

.slippage_block {
	margin-bottom: 24px;
}

.ratio_icon {
	fill: var(--opacity-40);
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

.banner {
	margin-bottom: 24px;
}
</style>
