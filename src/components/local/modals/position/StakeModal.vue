<script setup>
/**
 * Vendor
 */
import { ref, reactive, computed, watch } from "vue"
import { estimator } from "@juster-finance/sdk"
import { DateTime } from "luxon"
import BN from "bignumber.js"

/**
 * Services
 */
import { juster, currentNetwork, analytics } from "@sdk"
import { verifiedMakers, supportedMarkets, token } from "@config"
import { sanitizeInput, getCurrencyIcon } from "@utils/misc"
import { numberWithSymbol } from "@utils/amounts"
import { toReadableDuration } from "@utils/date"

/**
 * UI
 */
import LoadingBar from "@ui/LoadingBar.vue"
import Modal from "@ui/Modal.vue"
import Tooltip from "@ui/Tooltip.vue"
import Button from "@ui/Button.vue"
import Banner from "@ui/Banner.vue"
import Badge from "@ui/Badge.vue"

/**
 * Store
 */
import { useAppStore } from "@store/app"
import { useAccountStore } from "@store/account"
import { useNotificationsStore } from "@store/notifications"
import { useApplicationCacheStore } from "@store/cache"

/**
 * Composable
 */
import { useCountdown } from "@/composable/date"

const props = defineProps({
	show: Boolean,
	event: Object,
})

const emit = defineEmits(["onClose", "onBet", "onContinue"])

const appStore = useAppStore()
const accountStore = useAccountStore()
const notificationsStore = useNotificationsStore()
const cacheStore = useApplicationCacheStore()

const symbol = computed(() => props.event.currencyPair.symbol)

/** Countdown setup */
const eventStartTime = computed(() => new Date(props.event?.betsCloseTime).getTime())
const { countdownText, status: countdownStatus, start, stop } = useCountdown(eventStartTime)

/** User inputs */
const side = ref(props.preselectedSide)
const amount = reactive({ value: "5", error: "" })
const slippage = ref(2.5)

const handlePercent = (percent) => {
	amount.value = (accountStore.balance * percent).toFixed(2)
	cacheStore.submissions.amount = amount.value
}

const handleInput = () => {
	if (Number.isNaN(Number(amount.value))) {
		amount.value = parseFloat(amount.value)
	}

	if (amount.value) {
		cacheStore.submissions.amount = amount.value
	}

	if (amount.value > 50_000) {
		amount.value = 50_000
		return
	}

	if (amount.value > 0 && amount.value < 0.01) {
		amount.value = 0.01
		return
	}

	const splittedAmount = amount.value.toString().split(".")
	if (splittedAmount[1] && splittedAmount[1].length > 2) {
		amount.value = `${splittedAmount[0]}.${splittedAmount[1].slice(0, 2)}`
	}
}

const handleKeydown = (e) => {
	if (e.key.length == 1 && !e.metaKey && !e.ctrlKey && e.key !== "." && !/^\d+$/.test(e.key)) {
		e.preventDefault()
	}

	const hasSelection = !!window.getSelection().toString()
	if ((e.key == "." && !amount.value.toString().length) || (e.key == "." && hasSelection)) {
		e.preventDefault()
	}

	sanitizeInput(e)
}

const sendingBet = ref(false)

const balanceToAmountRatio = computed(() => {
	const percent = (amount.value * 100) / accountStore.balance

	return {
		percent,
		status:
			(percent == 0 && "awaiting") ||
			(percent < 40 && "ok") ||
			(percent < 70 && "medium") ||
			(percent < 100 && "bad") ||
			(percent > 100 && "bad"),
	}
})

/**
 * Ratio
 */
const ratio = computed(() => {
	const stakeAmount = !isNaN(parseFloat(amount.value)) ? parseFloat(amount.value) : 0
	const belowAmount = props.event.poolBelow
	const aboveAmount = props.event.poolAboveEq

	return {
		rise: (belowAmount + (side.value === "Fall" ? stakeAmount : 0)) / (aboveAmount + (side.value === "Rise" ? stakeAmount : 0)),
		fall: (aboveAmount + (side.value === "Rise" ? stakeAmount : 0)) / (belowAmount + (side.value === "Fall" ? stakeAmount : 0)),
	}
})
const ratioBeforeBet = computed(() => {
	return {
		rise: props.event.poolBelow / props.event.poolAboveEq,
		fall: props.event.poolAboveEq / props.event.poolBelow,
	}
})

const fee = computed(() =>
	estimator.estimateFee(
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
	const selectedRatio = side.value == "Rise" ? ratio.value.rise : ratio.value.fall

	return parseFloat(amount.value) * selectedRatio * (1 - fee.value)
})
const reward = computed(() => {
	return winDelta.value + parseFloat(amount.value)
})
const minReward = computed(() => {
	return winDelta.value * (1 - slippage.value / 100) + parseFloat(amount.value)
})

const payoutText = computed(() => {
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
		handleStake()
	}

	if (!e._vts && e.key == "ArrowUp") {
		side.value = "Rise"
	}
	if (!e._vts && e.key == "ArrowDown") {
		side.value = "Fall"
	}
}

watch(
	() => props.show,
	() => {
		if (!props.show) {
			stop()

			cacheStore.submissions.isTransactionConfirmed = false

			document.removeEventListener("keydown", onKeydown)
		} else {
			start()

			if (cacheStore.submissions.amount) amount.value = cacheStore.submissions.amount
			side.value = cacheStore.submissions.side

			if (cacheStore.submissions.isTransactionConfirmed) handleUserTransactionConfirmation()

			document.addEventListener("keydown", onKeydown)

			if (accountStore.isLoggined) accountStore.updateBalance()
		}
	},
)

const timing = computed(() => {
	const eventDt = DateTime.fromISO(props.event.betsCloseTime).setLocale("en")

	const endDt = eventDt.plus(props.event.measurePeriod * 1000)

	return {
		start: {
			time: eventDt.toLocaleString({
				hour: "numeric",
				minute: "numeric",
			}),
			day: eventDt.toLocaleString({
				day: "numeric",
			}),
			month: eventDt.toLocaleString({ month: "short" }),
		},
		end: {
			time: endDt.toLocaleString({
				hour: "numeric",
				minute: "numeric",
			}),
			day: endDt.toLocaleString({
				day: "numeric",
			}),
			month: endDt.toLocaleString({ month: "short" }),
		},
		showDay: eventDt.ordinal < endDt.ordinal,
	}
})

const buttonState = computed(() => {
	if (accountStore.pendingTransaction.awaiting) {
		return {
			text: "Previous transaction in process",
			disabled: true,
		}
	}

	if (!side.value) {
		return { text: "Choose the side", disabled: true }
	}

	if (countdownStatus.value !== "In progress") return { text: "Acceptance of stakes is closed", disabled: true }
	if (sendingBet.value) return { text: "Awaiting confirmation..", disabled: true }

	if (parseFloat(amount.value) > accountStore.balance) return { text: "Insufficient funds", disabled: true }

	switch (side.value) {
		case "Rise":
		case "Fall":
			if (!amount.value) return { text: "Type stake amount", disabled: true }
			if (amount.value)
				return {
					text: "Continue",
					disabled: false,
				}
	}
})

const handleStake = () => {
	if (buttonState.value.disabled) return

	cacheStore.submissions.event = props.event
	cacheStore.submissions.payout = payoutText.value
	cacheStore.submissions.side = side.value

	emit("onContinue")
}

const handleUserTransactionConfirmation = () => {
	if (buttonState.value.disabled) return

	let betType

	if (side.value == "Rise") betType = "aboveEq"
	if (side.value == "Fall") betType = "below"

	sendingBet.value = true
	accountStore.pendingTransaction.awaiting = true

	juster.sdk
		.bet(props.event.id, betType, BN(amount.value), BN(minReward.value))
		.then(() => {
			/** slow notification to get attention */
			setTimeout(() => {
				notificationsStore.create({
					notification: {
						type: "success",
						title: "Your bet has been accepted",
						// TODO: #3
						// description: "We need to process your bet, it will take 15-30 seconds",
						autoDestroy: true,
					},
				})
			}, 700)
			/** analytics */
			analytics.log("onBet", {
				eventId: props.event.id,
				amount: amount.value,
				fm: fee.value.toNumber(),
				tts: DateTime.fromISO(props.event.betsCloseTime).ts - DateTime.now().ts,
			})

			emit("onClose")
		})
		.catch((err) => {
			/** analytics */
			analytics.log("onError", {
				eventId: props.event.id,
				error: err.description,
			})
			/** slow notification to get attention */
			setTimeout(() => {
				notificationsStore.create({
					notification: {
						type: "warning",
						title: "Your bet was not accepted",
						description: err.description,
						autoDestroy: true,
					},
				})
			}, 700)
		})
		.finally(() => {
			sendingBet.value = false
			accountStore.pendingTransaction.awaiting = false
		})
}
</script>

<template>
	<Modal :show="show" width="500" closable :block-closing="appStore.confirmation.show" new @onClose="emit('onClose')">
		<Flex align="center" justify="between" :class="$style.head">
			<Flex align="center" gap="8">
				<Icon name="server" size="16" color="secondary" />

				<Text size="14" weight="600" color="secondary" :class="$style.head_btn"> Stake </Text>

				<Icon name="arrow" size="12" color="tertiary" rotate="-90" :class="$style.arrow_icon" />

				<Text size="14" weight="600" color="primary"> Event #{{ numberWithSymbol(event.id, ",") }} </Text>
			</Flex>

			<Icon @click="emit('onClose')" name="close" size="16" color="tertiary" :class="$style.close_icon" />
		</Flex>

		<Flex direction="column" gap="32" :class="$style.base">
			<Flex v-if="!verifiedMakers[currentNetwork].includes(event.creatorId)" gap="12" :class="$style.warning_badge">
				<Icon name="warning" size="16" color="orange" />

				<Flex direction="column" gap="8">
					<Text size="14" weight="600" color="primary"> This is custom event by user </Text>
					<Text size="13" weight="500" color="tertiary" height="16">
						At the moment we support such events partially, so the conditions and parameters may be unpredictable
					</Text>
				</Flex>
			</Flex>

			<Flex align="center" justify="between" :class="$style.event">
				<Flex align="center" gap="16">
					<div :class="$style.symbol_imgs">
						<img :src="getCurrencyIcon(symbol.split('-')[0])" alt="symbol" />
						<img :src="getCurrencyIcon('USD')" alt="symbol" />
					</div>

					<Flex direction="column" gap="8">
						<Text size="14" weight="600" color="primary">
							{{ supportedMarkets[symbol] && supportedMarkets[symbol].description }}
						</Text>

						<Flex align="center" gap="8">
							<Flex align="center" gap="4">
								<Icon name="price_event" size="12" color="tertiary" />
								<Text size="12" weight="600" color="tertiary">Price Event</Text>
							</Flex>

							<Text size="8" weight="500" color="tertiary"> ✦ </Text>

							<Text size="12" weight="600" color="tertiary">
								{{ countdownStatus.value !== "In progress" ? "Open" : "Closed" }}
							</Text>
						</Flex>
					</Flex>
				</Flex>

				<Flex gap="12">
					<Badge v-if="countdownStatus == 'In progress' && event.status == 'NEW'" size="small" color="purple">
						<Icon name="event_new" size="12" />New
					</Badge>

					<Badge v-else-if="countdownStatus == 'Finished' && event.status == 'NEW'" color="yellow" :class="$style.main_badge">
						<Icon name="event_new" size="12" />Starting
					</Badge>
					<Badge v-else-if="event.status == 'STARTED'" color="yellow" :class="$style.main_badge">
						<Icon name="event_active" size="12" />Running
					</Badge>
					<Badge v-else-if="event.status == 'FINISHED'" color="green" :class="$style.main_badge">
						<Icon name="event_finished" size="12" />Finished
					</Badge>
					<Badge v-else-if="event.status == 'CANCELED'" color="gray" :class="$style.main_badge">
						<Icon name="stop" size="12" />Canceled
					</Badge>

					<Badge color="gray" :class="$style.badge">
						<Icon name="time" size="12" />

						{{ timing.start.time }},
						<span>
							{{
								toReadableDuration({
									seconds: event.measurePeriod,
									asObject: true,
								}).val
							}}{{
								toReadableDuration({
									seconds: event.measurePeriod,
									asObject: true,
								}).text[0].toUpperCase()
							}}
						</span>
					</Badge>
				</Flex>
			</Flex>

			<Flex direction="column" gap="4">
				<Flex gap="4">
					<Flex
						@click="selectTab('Rise')"
						wide
						align="center"
						justify="between"
						:class="[$style.side_btn, $style.left, side === 'Rise' && $style.higher]"
					>
						<Flex align="center" gap="6">
							<Icon name="higher" size="14" color="primary" />
							<Text size="14" weight="600" color="primary"> Rise </Text>
						</Flex>

						<Flex>
							<Text size="12" weight="600" color="tertiary" :class="$style.ratio"> x</Text>
							<Text size="12" weight="600" color="secondary" :class="$style.ratio"> {{ (1 + ratio.rise).toFixed(2) }} </Text>
						</Flex>
					</Flex>

					<Flex
						@click="selectTab('Fall')"
						wide
						align="center"
						justify="between"
						:class="[$style.side_btn, $style.right, side === 'Fall' && $style.lower]"
					>
						<Flex>
							<Text size="12" weight="600" color="tertiary" :class="$style.ratio"> x</Text>
							<Text size="12" weight="600" color="secondary" :class="$style.ratio"> {{ (1 + ratio.fall).toFixed(2) }} </Text>
						</Flex>

						<Flex align="center" gap="6">
							<Icon name="lower" size="14" color="primary" />
							<Text size="14" weight="600" color="primary"> Fall </Text>
						</Flex>
					</Flex>
				</Flex>

				<Flex direction="column" gap="16" :class="$style.stake_block">
					<Text size="14" weight="600" color="secondary">Stake</Text>

					<Flex align="center" gap="24">
						<Flex wide :class="$style.field">
							<input
								v-model="amount.value"
								type="string"
								inputmode="decimal"
								pattern="^[0-9]*[.]?[0-9]*$"
								@keydown="handleKeydown"
								@input="handleInput"
								autocomplete="off"
								autocorrect="off"
								autofocus
								:class="$style.active_input"
							/>
							<input :value="`${amount.value} ${token.symbol}`" disabled :class="$style.behind_input" />
						</Flex>

						<Flex align="center" gap="8" :class="$style.percent_btns">
							<Text @click="handlePercent(0.01)" size="14" weight="600" color="primary" :class="$style.percent_btn">
								1%
							</Text>
							<Text @click="handlePercent(0.05)" size="14" weight="600" color="primary" :class="$style.percent_btn">
								5%
							</Text>
							<Text @click="handlePercent(0.1)" size="14" weight="600" color="primary" :class="$style.percent_btn">
								10%
							</Text>
						</Flex>
					</Flex>
				</Flex>

				<Banner v-if="ratio.rise < 0.5 || ratio.fall < 0.5" icon="warning" color="yellow" size="small" style="border-radius: 4px">
					Too much displacement of the payout ratio
				</Banner>

				<Flex direction="column" gap="16" :class="$style.payout_block">
					<Flex align="center" gap="4">
						<Text size="14" weight="600" color="secondary"> Success Payout </Text>

						<Tooltip placemenet="bottom">
							<Icon name="help" size="14" color="support" />

							<template #content>
								This payout depends on the outcome<br />
								of the event and the side you choose
							</template>
						</Tooltip>
					</Flex>

					<Flex>
						<Text size="26" weight="600" color="secondary">
							{{ payoutText }}
						</Text>
						<Text size="26" weight="600" color="tertiary"> &nbsp;{{token.symbol}} </Text>
					</Flex>
				</Flex>
			</Flex>

			<Flex direction="column" gap="20">
				<Flex align="center" justify="between">
					<Text size="14" weight="600" color="tertiary"> Balance check </Text>

					<Flex align="center" gap="4">
						<Icon
							:name="balanceToAmountRatio.status !== 'bad' ? 'checkcircle' : 'warning'"
							size="12"
							:color="
								(balanceToAmountRatio.status === 'awaiting' && 'tertiary') ||
								(balanceToAmountRatio.status === 'ok' && 'green') ||
								(balanceToAmountRatio.status === 'medium' && 'yellow') ||
								(balanceToAmountRatio.status === 'bad' && 'red')
							"
						/>
						<Text size="12" weight="700" color="secondary">
							{{
								balanceToAmountRatio.percent > 0 && balanceToAmountRatio.percent < 1
									? "<1"
									: balanceToAmountRatio.percent.toFixed(0)
							}}%
						</Text>
					</Flex>
				</Flex>
				<Flex align="center" justify="between">
					<Text size="14" weight="600" color="tertiary"> Time to start </Text>

					<Text size="14" weight="600" color="secondary">
						{{ countdownText }}
					</Text>
				</Flex>
			</Flex>

			<Button @click="handleStake" size="large" type="primary" block :loading="sendingBet" :disabled="buttonState.disabled">
				<LoadingBar v-if="sendingBet" size="16" />
				<template v-else>
					<Icon name="login" size="16" />
					{{ buttonState.text }}
				</template>
			</Button>
		</Flex>
	</Modal>
</template>

<style module>
.head {
	height: 56px;

	padding: 0 20px;
}

.head_btn {
	cursor: pointer;
}

.close_icon {
	cursor: pointer;
}

.base {
	padding: 16px 20px 20px 20px;
}

.warning_badge {
	border-radius: 8px;
	background: var(--app-bg);

	padding: 16px;
}

.side_btn {
	height: 40px;

	background: rgba(255, 255, 255, 0.05);
	cursor: pointer;

	padding: 0 16px;

	transition: all 0.2s var(--bezier);
}

.side_btn.left {
	border-radius: 12px 4px 4px 4px;
}

.side_btn.right {
	border-radius: 4px 12px 4px 4px;
}

.side_btn:hover {
	background: rgba(255, 255, 255, 0.1);
}

.side_btn.higher {
	background: #3c6554;
}

.side_btn.lower {
	background: #65433c;
}

.stake_block {
	background: rgba(255, 255, 255, 0.05);
	border-radius: 4px;

	padding: 20px 20px 24px 20px;
}

.field {
	position: relative;

	height: 26px;
}

.active_input {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;

	height: 26px;

	font-size: 26px;
	line-height: 26px;
	font-weight: 600;
	color: var(--text-primary);

	padding: 0;
}

.behind_input {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;

	height: 26px;

	font-size: 26px;
	line-height: 26px;
	font-weight: 600;
	color: var(--text-tertiary);

	pointer-events: none;

	padding: 0;
}

.stake_block input::-webkit-outer-spin-button,
.stake_block input::-webkit-inner-spin-button {
	-webkit-appearance: none;
	margin: 0;
}

.payout_block {
	background: rgba(255, 255, 255, 0.05);
	border-radius: 4px 4px 12px 12px;

	padding: 20px 20px 24px 20px;
}

.percent_btns {
	opacity: 0.5;

	transition: all 0.2s ease;
}

.percent_btns:hover {
	opacity: 1;
}

.percent_btn {
	display: flex;
	align-items: center;

	height: 28px;

	background: rgba(255, 255, 255, 0.08);
	border-radius: 6px;
	cursor: pointer;

	padding: 0 8px;

	transition: all 0.2s ease;
}

.percent_btn:hover {
	background: rgba(255, 255, 255, 0.16);
}

.symbol_imgs {
	position: relative;

	width: 30px;
	height: 30px;
}

.symbol_imgs img {
	width: 20px;
	height: 20px;
	border-radius: 5px;
}

.symbol_imgs img:first-child {
	position: absolute;
	z-index: 1;
	outline: 3px solid var(--card-bg);
}

.symbol_imgs img:last-child {
	position: absolute;
	top: 10px;
	right: 0;
}

@media (max-width: 500px) {
	.event {
		flex-direction: column;
		align-items: flex-start;
		gap: 24px;
	}
}
</style>
