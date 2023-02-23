<script setup>
/** Vendor */
import { ref, computed, watch } from "vue"
import { DateTime } from "luxon"

/**
 * UI
 */
import Modal from "@ui/Modal.vue"
import Button from "@ui/Button.vue"

/**
 * Services
 */
import { shorten, capitalizeFirstLetter } from "@utils/misc"
import { numberWithSymbol } from "@utils/amounts"
import { toReadableDuration } from "@utils/date"

/**
 * Store
 */
import { useAccountStore } from "@store/account"
import { useApplicationCacheStore } from "@store/cache"

const props = defineProps({
	show: Boolean,
})
const emit = defineEmits(["onCancel", "onConfirm"])

const accountStore = useAccountStore()
const cacheStore = useApplicationCacheStore()

const interestRateFromBalance = computed(() => {
	const amount = cacheStore.submissions.amount
	const balance = accountStore.balance
	return (amount * 100) / balance
})

let timerInterval = ref(null)
const timer = ref(5)

watch(
	() => props.show,
	() => {
		if (!props.show) {
			clearInterval(timerInterval.value)
			timerInterval.value = null
			timer.value = 5
		} else {
			if (interestRateFromBalance.value >= 50) {
				timerInterval.value = setInterval(() => {
					timer.value -= 1

					if (timer.value === 0) {
						clearInterval(timerInterval.value)
						timerInterval.value = null
						timer.value = 5
					}
				}, 1000)
			}
		}
	},
)
</script>

<template>
	<Modal :show="show" width="500" required new>
		<Flex align="center" justify="between" :class="$style.head">
			<Flex align="center" gap="8">
				<Icon name="checkcircle" size="16" color="secondary" />

				<Text
					size="14"
					weight="600"
					color="primary"
					:class="$style.head_btn"
				>
					Stake Confirmation
				</Text>
			</Flex>
		</Flex>

		<Flex direction="column" gap="32" :class="$style.base">
			<Flex direction="column" gap="16">
				<Flex align="center">
					<Text size="13" weight="500" color="tertiary" height="16">
						Once your stake is accepted, it will be listed in the
						event stakes list and in your profile. You can retrieve
						your winnings once the event concludes.
					</Text>
				</Flex>

				<Flex
					v-if="interestRateFromBalance >= 80"
					gap="12"
					:class="$style.warning_badge"
				>
					<Icon name="warning" size="16" color="orange" />

					<Flex direction="column" gap="8">
						<Text size="14" weight="600" color="primary">
							Dangerously large stake size
						</Text>
						<Text
							size="13"
							weight="500"
							color="tertiary"
							height="16"
						>
							Your stake is equal or close to the size of your
							entire balance
						</Text>
					</Flex>
				</Flex>
				<Flex
					v-else-if="interestRateFromBalance >= 50"
					gap="12"
					:class="$style.warning_badge"
				>
					<Icon name="warning" size="16" color="tertiary" />

					<Flex direction="column" gap="8">
						<Text size="14" weight="600" color="primary">
							Dangerously large stake size
						</Text>
						<Text
							size="13"
							weight="500"
							color="tertiary"
							height="16"
						>
							Your stake size is more than half of your account
							balance
						</Text>
					</Flex>
				</Flex>
			</Flex>

			<Flex direction="column" gap="8">
				<Flex align="center" justify="between">
					<Text size="12" weight="600" color="secondary">
						Stake
					</Text>
				</Flex>

				<Flex align="center" justify="between" :class="$style.badge">
					<Flex align="center" gap="8">
						<Icon
							:name="
								cacheStore.submissions.side === 'Rise'
									? 'higher'
									: 'lower'
							"
							size="14"
							:color="
								cacheStore.submissions.side === 'Rise'
									? 'green'
									: 'orange'
							"
						/>

						<Flex>
							<Text size="14" weight="600" color="primary">
								{{
									numberWithSymbol(
										cacheStore.submissions.amount,
										",",
									)
								}}
							</Text>
							<Text size="14" weight="600" color="tertiary">
								&nbsp;XTZ
							</Text>
						</Flex>
					</Flex>

					<Text size="14" weight="600" color="tertiary">-></Text>

					<Flex align="center" gap="6">
						<Icon name="event_new" size="14" color="purple" />

						<Flex align="center">
							<Text size="14" weight="600" color="secondary">
								{{
									cacheStore.submissions.event.currencyPair.symbol.replace(
										"-",
										"/",
									)
								}}
							</Text>
							<Text size="14" weight="600" color="tertiary">
								&nbsp;({{
									toReadableDuration({
										seconds:
											cacheStore.submissions.event
												.measurePeriod,
										asObject: true,
									}).val
								}}{{
									toReadableDuration({
										seconds:
											cacheStore.submissions.event
												.measurePeriod,
										asObject: true,
									}).text[0].toUpperCase()
								}})
							</Text>
						</Flex>
					</Flex>
				</Flex>
			</Flex>

			<Flex direction="column" gap="8">
				<Flex align="center" justify="between">
					<Text size="12" weight="600" color="tertiary">
						Details
					</Text>

					<Flex align="center" gap="4">
						<Icon name="bolt" size="12" color="support" />
						<Text size="12" weight="600" color="support">
							Quick Acceptance (~10s)
						</Text>
					</Flex>
				</Flex>

				<Flex align="center" justify="between" :class="$style.badge">
					<Flex align="center" gap="8">
						<Icon name="go" size="14" color="tertiary" />

						<Text size="14" weight="600" color="primary">
							{{
								capitalizeFirstLetter(
									DateTime.fromISO(
										cacheStore.submissions.event
											.betsCloseTime,
									)
										.setLocale("en")
										.toRelative(),
								)
							}}
						</Text>
					</Flex>

					<div v-for="i in 4" :class="$style.dot" />
					<Text size="14" weight="600" color="tertiary">
						{{
							toReadableDuration({
								seconds:
									cacheStore.submissions.event.measurePeriod,
								asObject: true,
							}).val
						}}{{
							toReadableDuration({
								seconds:
									cacheStore.submissions.event.measurePeriod,
								asObject: true,
							}).text[0].toUpperCase()
						}}
					</Text>
					<div v-for="i in 4" :class="$style.dot" />

					<Flex align="center" gap="8">
						<Icon name="flag" size="14" color="tertiary" />

						<Flex align="center">
							<Text size="14" weight="600" color="primary">
								{{
									DateTime.fromISO(
										cacheStore.submissions.event
											.betsCloseTime,
									)
										.plus(
											cacheStore.submissions.event
												.measurePeriod * 1000,
										)
										.toFormat("dd LLL")
								}}
							</Text>
							&nbsp;
							<Text size="14" weight="600" color="tertiary">
								at
							</Text>
							&nbsp;
							<Text size="14" weight="600" color="primary">
								{{
									DateTime.fromISO(
										cacheStore.submissions.event
											.betsCloseTime,
									)
										.plus(
											cacheStore.submissions.event
												.measurePeriod * 1000,
										)
										.toFormat("HH:mm")
								}}
							</Text>
						</Flex>
					</Flex>
				</Flex>

				<Flex align="center" justify="between" :class="$style.badge">
					<Flex align="center" gap="8">
						<Icon name="walletadd" size="14" color="tertiary" />

						<Text size="14" weight="600" color="primary">
							Success Payout
						</Text>
					</Flex>

					<Flex>
						<Text size="14" weight="600" color="primary">
							~{{
								numberWithSymbol(
									cacheStore.submissions.payout,
									",",
								)
							}}
						</Text>
						<Text size="14" weight="600" color="tertiary">
							&nbsp;XTZ
						</Text>
					</Flex>
				</Flex>

				<Flex align="center" justify="between" :class="$style.badge">
					<Flex align="center" gap="8">
						<Icon name="wallet" size="14" color="tertiary" />

						<Text size="14" weight="600" color="primary">
							Wallet in use
						</Text>
					</Flex>

					<Text size="14" weight="600" color="primary">
						{{ shorten(accountStore.pkh, 4, 4) }}
					</Text>
				</Flex>
			</Flex>

			<Flex gap="16" :class="$style.buttons">
				<Button
					@click="emit('onCancel')"
					type="secondary"
					size="medium"
					block
				>
					Cancel
				</Button>
				<Button
					@click="emit('onConfirm')"
					type="primary"
					size="medium"
					block
					:disabled="!!timerInterval"
				>
					<Icon v-if="!timerInterval" name="check" size="16" />
					{{ timerInterval ? timer : "Confirm" }}
				</Button>
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

.base {
	padding: 0 20px 20px 20px;
}

.badge {
	height: 38px;

	border-radius: 8px;
	background: rgba(255, 255, 255, 0.05);

	padding: 0 12px;
}

.dot {
	width: 4px;
	height: 4px;
	border-radius: 50%;
	background: var(--text-support);
}

.warning_badge {
	border-radius: 8px;
	background: var(--app-bg);

	padding: 16px;
}
</style>
