<script setup>
/**
 * Vendor
 */
import { ref, computed } from "vue"
import { DateTime } from "luxon"
import cloneDeep from "lodash.clonedeep"

/**
 * UI
 */
import LoadingBar from "@ui/LoadingBar.vue"
import Modal from "@ui/Modal.vue"
import Button from "@ui/Button.vue"
import Pagination from "@ui/Pagination.vue"

/**
 * Services
 */
import { juster } from "@sdk"
import { shorten } from "@utils/misc"
import { numberWithSymbol } from "@utils/amounts"

/**
 * Store
 */
import { useAccountStore } from "@store/account"
import { useNotificationsStore } from "@store/notifications"

const accountStore = useAccountStore()
const notificationsStore = useNotificationsStore()

const props = defineProps({
	show: Boolean,
	positions: Object,
})

const emit = defineEmits(["onClose"])

const pendingClaims = computed(() => {
	let claims = []
	props.positions.forEach((position) => {
		claims = [
			...claims,
			...position.claims.filter((claim) => !claim.event.result),
		]
	})
	return claims
})
const availableClaims = computed(() => {
	let claims = []
	props.positions.forEach((position) => {
		claims = [
			...claims,
			...position.claims.filter(
				(claim) => claim.event.result && !claim.withdrawn,
			),
		]
	})
	return claims
})
const affectedPools = computed(() => [
	...new Set(availableClaims.value.map((claim) => claim.poolId)),
])

const paginationPage = ref(1)
const paginatedClaims = computed(() =>
	cloneDeep(availableClaims.value).slice(
		(paginationPage.value - 1) * 5,
		paginationPage.value * 5,
	),
)

const nextClaim = computed(() => {
	let closest

	pendingClaims.value.forEach((claim) => {
		const diff = DateTime.fromISO(claim.event.event.betsCloseTime)
			.plus(claim.event.event.measurePeriod * 1000)
			.diff(DateTime.now(), ["minutes"])
			.toObject()

		if (!closest) {
			closest = {
				claim,
				diff,
			}
			return
		}

		const closestDiff = DateTime.fromISO(
			closest.claim.event.event.betsCloseTime,
		)
			.plus(closest.claim.event.event.measurePeriod * 1000)
			.diff(DateTime.now(), ["minutes"])
			.toObject()

		if (diff.minutes < closestDiff.minutes) {
			closest.claim = claim
			closest.diff = diff
		}
	})

	return closest
})

// const handleWithdrawClaims = async ({ eventIds, address }) => {
// 	try {
// 		const contract = await juster.sdk._tezos.contract.at(
// 			contracts[
// 				juster.sdk._network === "mainnet" ? "mainnet" : "testnet"
// 			],
// 		)

// 		if (!eventIds.length || !address) return

// 		const transactions = []
// 		eventIds.forEach((id) => {
// 			transactions.push({
// 				kind: "transaction",
// 				...contract.methods.withdraw(id, address).toTransferParams(),
// 			})
// 		})

// 		const batch = await juster.sdk._tezos.wallet.batch(transactions)

// 		const batchOp = await batch.send()

// 		return { success: true, hash: batchOp.hash }
// 	} catch (error) {
// 		return { success: false, title: error.title, message: error.message }
// 	}
// }
const opConfirmationInProgress = ref(false)
const handleWithdraw = async () => {
	if (buttonState.disabled) return

	opConfirmationInProgress.value = true

	try {
		const op = await juster.pools[
			"KT1M6fueToCaYBTeG25XZEFCa7YXcNDMn12x"
		].withdrawClaims(
			availableClaims.value.map((claim) => {
				return {
					eventId: claim.eventId,
					provider: accountStore.pkh,
				}
			}),
		)

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
				title: "Your withdraw has been accepted",
				description:
					"We need to process your request, it will take ~30 seconds",
				autoDestroy: true,
			},
		})

		opConfirmationInProgress.value = false
		emit("onClose")
	} catch (error) {
		if (error.title == "Aborted") {
			notificationsStore.create({
				notification: {
					icon: "warning",
					title: "The operation was rejected",
					description: `The withdrawal request was not accepted`,
					autoDestroy: true,
				},
			})
		} else {
			console.log(error)
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
			type: "secondary",
		}
	if (opConfirmationInProgress.value)
		return {
			text: "Awaiting confirmation..",
			disabled: true,
			type: "secondary",
		}

	return {
		text: `Continue to confirmation`,
		disabled: false,
		type: "primary",
	}
})
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
					Withdraw claims
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
				<Flex align="center" justify="between">
					<Text size="12" weight="600" color="secondary">
						Withdrawal
					</Text>
					<Text size="12" weight="600" color="tertiary">
						{{ affectedPools.length }} affected
						{{ affectedPools.length > 1 ? "pools" : "pool" }}
					</Text>
				</Flex>

				<Flex align="center" justify="between" :class="$style.badge">
					<Flex align="center" gap="8">
						<Icon name="money" size="14" color="green" />

						<Flex>
							<Text size="14" weight="600" color="primary">
								{{
									numberWithSymbol(
										availableClaims
											.reduce(
												(acc, { amount }) =>
													(acc += amount),
												0,
											)
											.toFixed(2),
										",",
									)
								}}
							</Text>
							<Text size="14" weight="600" color="tertiary">
								&nbsp;ꜩ
							</Text>
						</Flex>
					</Flex>

					<Text size="14" weight="600" color="tertiary">-></Text>

					<Flex align="center" gap="6">
						<img
							:src="`https://services.tzkt.io/v1/avatars/${accountStore.pkh}`"
							alt="avatar"
							:class="$style.avatar"
						/>

						<Flex align="center">
							<Text size="14" weight="600" color="secondary">
								{{ shorten(accountStore.pkh) }}
							</Text>
						</Flex>
					</Flex>
				</Flex>
			</Flex>

			<Flex direction="column" gap="16">
				<Flex direction="column" gap="8">
					<Flex align="center" justify="between">
						<Text size="12" weight="600" color="tertiary">
							Claims to withdraw
						</Text>
						<Text
							v-if="pendingClaims.length"
							size="12"
							weight="600"
							color="support"
						>
							Next available claim in
							{{ nextClaim.diff.minutes.toFixed(0) }} min
						</Text>
					</Flex>

					<Flex
						v-for="claim in paginatedClaims"
						align="center"
						justify="between"
						:class="$style.badge"
					>
						<Flex align="center" gap="8">
							<Icon
								name="checkcircle"
								size="14"
								color="tertiary"
							/>

							<Flex>
								<Text size="14" weight="600" color="primary">
									Claim
								</Text>
								<Text size="14" weight="600" color="tertiary">
									&nbsp;#{{ claim.id }}
								</Text>
							</Flex>
						</Flex>

						<Flex align="center" gap="8">
							<Icon name="banknote" size="14" color="tertiary" />

							<Flex>
								<Text size="14" weight="600" color="primary">
									{{
										numberWithSymbol(
											claim.amount.toFixed(2),
											",",
										)
									}}
								</Text>
								<Text size="14" weight="600" color="tertiary">
									&nbsp;ꜩ
								</Text></Flex
							>
						</Flex>
					</Flex>
				</Flex>

				<Pagination
					v-if="availableClaims.length > 5"
					v-model="paginationPage"
					:total="availableClaims.length"
					:limit="5"
					disable-arrows
				/>
			</Flex>

			<Button
				@click="handleWithdraw"
				:type="buttonState.type"
				:disabled="buttonState.disabled"
				:loading="opConfirmationInProgress"
				size="large"
				block
			>
				<LoadingBar v-if="opConfirmationInProgress" size="16" />
				<template v-else>
					<Icon name="login" size="16" color="white" />
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
	padding: 8px 20px 20px 20px;
}

.badge {
	height: 38px;

	border-radius: 8px;
	background: rgba(255, 255, 255, 0.05);

	padding: 0 12px;
}

.avatar {
	width: 20px;
	height: 20px;
	border-radius: 50%;
}
</style>
