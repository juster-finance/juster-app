<script setup>
/**
 * Vendor
 */
import { ref, reactive, watch, computed, nextTick } from "vue"
import BN from "bignumber.js"

/**
 * UI
 */
import Spin from "@ui/Spin.vue"
import Modal from "@ui/Modal.vue"
import Input from "@ui/Input.vue"
import Button from "@ui/Button.vue"
import Block from "@ui/Block.vue"
import Tooltip from "@ui/Tooltip.vue"

/**
 * Services
 */
import { juster, analytics } from "@sdk"
import { sanitizeInput } from "@utils/misc"
import { numberWithSymbol } from "@utils/amounts"
import { flags, updateFlag } from "@/services/flags"

/**
 * Store
 */
import { useAccountStore } from "@store/account"
import { useNotificationsStore } from "@store/notifications"

const accountStore = useAccountStore()
const notificationsStore = useNotificationsStore()

const props = defineProps({
	show: Boolean,
	selectedPool: Object,
	position: Object,
	state: Object,
})

const emit = defineEmits(["onClose"])

const inputEl = ref(null)
const amount = reactive({ value: 0, error: "" })

const opConfirmationInProgress = ref(false)
const handleDeposit = async () => {
	if (buttonState.disabled) return

	opConfirmationInProgress.value = true

	try {
		const op = await juster.pools[
			props.selectedPool.address
		].claimLiquidity(accountStore.pkh, BN(amount.value))

		accountStore.pendingTransaction.awaiting = true
		op.confirmation()
			.then(() => {
				accountStore.pendingTransaction.awaiting = false
			})
			.catch(() => {
				accountStore.pendingTransaction.awaiting = false
			})

		notificationsStore.create({
			notification: {
				type: "success",
				title: "Your request has been accepted",
				description:
					"We need to process your request, it will take ~30 seconds",
				autoDestroy: true,
			},
		})

		analytics.log("onPoolDeposit", {
			pool: props.selectedPool.address,
		})

		opConfirmationInProgress.value = false
		emit("onClose")
	} catch (error) {
		console.log(error)

		if (error.title == "Aborted") {
			notificationsStore.create({
				notification: {
					icon: "warning",
					title: "The operation was rejected",
					description: `The withdrawal request for ${amount.value.toFixed(
						2,
					)} shares was not accepted`,
					autoDestroy: true,
				},
			})
		} else {
			notificationsStore.create({
				notification: {
					icon: "warning",
					title: "Something went wrong",
					description: "Repeat the operation or wait for a while",
					autoDestroy: true,
				},
			})
		}

		opConfirmationInProgress.value = false
	}
}

const buttonState = computed(() => {
	if (accountStore.pendingTransaction.awaiting)
		return {
			text: "Previous transaction in process",
			disabled: true,
		}
	if (opConfirmationInProgress.value)
		return {
			text: "Awaiting confirmation..",
			disabled: true,
			type: "secondary",
		}
	if (!amount.value)
		return {
			text: "Type shares amount",
			disabled: true,
			type: "secondary",
		}
	if (amount.value > props.position.shares)
		return {
			text: "Insufficient amount of shares",
			disabled: true,
			type: "secondary",
		}

	return {
		text: `Request ${amount.value.toFixed(2)} shares to withdraw`,
		disabled: false,
		type: "secondary",
	}
})

const handleKeydown = (e) => {
	sanitizeInput(e)
}

watch(
	() => props.show,
	() => {
		if (props.show) {
			nextTick(() => {
				inputEl.value.$el.querySelector("input").focus()
			})
		} else {
			amount.value = 0
		}
	},
)

const handleCloseRequestFundsWarning = () => {
	updateFlag("showRequestFundsWarning", false)

	notificationsStore.create({
		notification: {
			type: "success",
			title: "Hint is now hidden",
			autoDestroy: true,

			actions: [
				{
					name: "Undo",
					icon: "back",
					callback: () => {
						updateFlag("showRequestFundsWarning", true)
					},
				},
			],
		},
	})
}
</script>

<template>
	<Modal new :show="show" width="550" closable @onClose="emit('onClose')">
		<Flex align="center" justify="between" :class="$style.head">
			<Flex align="center" gap="8">
				<Icon name="money" size="16" color="secondary" />

				<Text
					@click="emit('onBack')"
					size="14"
					weight="600"
					color="secondary"
					:class="$style.head_btn"
				>
					Request Withdraw
				</Text>
			</Flex>

			<Icon
				@click="emit('onClose')"
				name="close"
				size="16"
				color="tertiary"
				:class="$style.close_icon"
			/>
		</Flex>

		<Flex direction="column" gap="32" :class="$style.base">
			<Flex direction="column" gap="8">
				<Flex align="center" justify="between" :class="$style.pool">
					<Flex align="center" gap="20">
						<Flex direction="column" gap="8">
							<Text size="14" weight="600" color="primary">
								{{
									selectedPool.name.replace(
										"Juster Pool: ",
										"",
									)
								}}
							</Text>

							<Flex align="center" gap="8">
								<Flex align="center" gap="4">
									<Icon
										name="zap_circle"
										size="12"
										color="green"
									/>
									<Text size="12" weight="700" color="green">
										Active
									</Text>
								</Flex>

								<Text size="8" color="support">✦</Text>

								<Text size="12" weight="600" color="tertiary">
									Pool
								</Text>
							</Flex>
						</Flex>
					</Flex>

					<Flex align="center" gap="24">
						<Flex direction="column" gap="8" align="end">
							<Flex align="center" gap="6">
								<Icon name="coins" size="12" color="tertiary" />

								<Text size="14" weight="600" color="primary">
									{{ position.shares.toFixed(2) }}
								</Text>

								<template
									v-if="
										amount.value > 0 &&
										amount.value <= position.shares
									"
								>
									<Text
										size="14"
										weight="600"
										color="tertiary"
									>
										-
										{{
											numberWithSymbol(amount.value, ",")
										}}
										=
									</Text>
									<Text
										size="14"
										weight="600"
										color="secondary"
									>
										{{
											numberWithSymbol(
												position.shares - amount.value,
												",",
											)
										}}
									</Text>
								</template>
							</Flex>

							<Text size="12" weight="600" color="tertiary">
								Available Shares
							</Text>
						</Flex>
					</Flex>
				</Flex>
			</Flex>

			<Block
				v-if="flags.showRequestFundsWarning"
				@onClose="handleCloseRequestFundsWarning"
			>
				<span>
					This is a withdrawal request (not the withdrawal to the
					wallet itself).
				</span>
				It is necessary to wait until the completion of events where
				your funds are used and then they will be ready for the full
				withdrawal.
			</Block>

			<Input
				ref="inputEl"
				type="number"
				:limit="1000000"
				label="Shares"
				placeholder="Shares to withdraw"
				v-model="amount.value"
				@keydown="handleKeydown"
				:class="$style.amount_input"
			/>

			<Flex align="center" justify="between" :class="$style.badge">
				<Flex align="center" gap="8">
					<Icon name="coins" size="14" color="tertiary" />

					<Flex align="center">
						<Text size="14" weight="600" color="primary">
							{{
								amount.value
									? numberWithSymbol(amount.value, ",")
									: 0
							}} </Text
						>&nbsp;
						<Text size="14" weight="600" color="tertiary"
							>shares</Text
						>&nbsp;
						<Text size="14" weight="600" color="support"> -> </Text
						>&nbsp;
						<Text size="14" weight="600" color="secondary">
							~
						</Text>
						<Text size="14" weight="600" color="primary">
							{{
								amount.value
									? numberWithSymbol(
											amount.value * state.sharePrice,
											",",
									  )
									: 0
							}} </Text
						>&nbsp;
						<Text size="14" weight="600" color="tertiary"> ꜩ </Text>
					</Flex>
				</Flex>

				<Tooltip placement="bottom-end" text-align="end">
					<Flex align="center" gap="8">
						<Icon name="banknote" size="14" color="tertiary" />
						<Text size="14" weight="600" color="primary">
							{{ state.sharePrice.toFixed(2) }}
						</Text>
					</Flex>

					<template #content>
						Share price<br />
						<span> Used to calculate the amount of payment</span>
					</template>
				</Tooltip>
			</Flex>

			<Flex direction="column" gap="12" align="center">
				<Button
					@click="handleDeposit"
					:type="buttonState.type"
					:disabled="buttonState.disabled"
					:loading="opConfirmationInProgress"
					size="large"
					block
				>
					<Spin v-if="opConfirmationInProgress" size="16" />
					<Icon v-else name="money" size="16" color="white" />
					{{ buttonState.text }}
				</Button>

				<Text
					size="12"
					weight="500"
					color="support"
					align="center"
					height="16"
					style="max-width: 400px"
				>
					The requested funds are still being used in events. Let's
					wait until they are finished and be ready for the full
					withdrawal
				</Text>
			</Flex>
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
	padding: 8px 20px 20px 20px;
}

.pool {
	height: 66px;

	background: rgba(255, 255, 255, 0.05);
	border-radius: 8px;

	padding: 0 16px;
}

.badge {
	height: 38px;

	border-radius: 8px;
	background: rgba(255, 255, 255, 0.05);

	padding: 0 12px;
}
</style>
