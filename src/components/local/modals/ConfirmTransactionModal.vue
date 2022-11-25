<script setup>
/** Vendor */
import { ref, computed, watch } from "vue"

/**
 * UI
 */
import Modal from "@ui/Modal.vue"
import Banner from "@ui/Banner.vue"
import Button from "@ui/Button.vue"

/**
 * Store
 */
import { useAccountStore } from "@store/account"
import { useMarketStore } from "@store/market"
import { useApplicationCacheStore } from "@store/cache"

const props = defineProps({
	show: Boolean,
})
const emit = defineEmits(["onCancel"])

const accountStore = useAccountStore()
const marketStore = useMarketStore()
const cacheStore = useApplicationCacheStore()

const amountInUsd = computed(() => {
	const price = marketStore.markets["XTZ-USD"].quotes[0].price
	return cacheStore.submissions.amount * price
})

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
			if (interestRateFromBalance.value >= 30) {
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
	<Modal :show="show" width="500" required @onClose="$emit('onClose')">
		<div :class="$style.title">Confirm Transaction</div>
		<div :class="$style.description">
			Carefully double-check the correctness of the entered data
		</div>

		<Flex direction="column" gap="32">
			<Flex justify="between">
				<div :class="$style.left">
					<span>Amount</span>
					<span>Your bet</span>
				</div>

				<div :class="$style.right">
					<span>
						<b>{{ cacheStore.submissions.amount }}</b> XTZ
					</span>
					<span>${{ amountInUsd.toFixed(2) }}</span>
				</div>
			</Flex>
			<Flex justify="between">
				<div :class="$style.left">
					<span>Type</span>
					<span>Selected event</span>
				</div>

				<div :class="$style.right">
					<span><b>Price Event</b></span>
					<span>Tezos (2.52), 6 hours</span>
				</div>
			</Flex>
			<Flex justify="between">
				<div :class="$style.left">
					<span>Balance</span>
				</div>

				<div :class="$style.right">
					<span
						><b>{{ accountStore.balance.split(".")[0] }}</b
						>.{{ accountStore.balance.split(".")[1] }} XTZ</span
					>

					<span
						:class="
							(interestRateFromBalance >= 80 && $style.red) ||
							(interestRateFromBalance >= 50 && $style.yellow) ||
							(interestRateFromBalance >= 30 && $style.yellow)
						"
					>
						<Flex align="center" gap="4">
							<Icon
								v-if="interestRateFromBalance >= 30"
								name="warning"
								size="12"
							/>
							{{ cacheStore.submissions.amount }} XTZ =
							{{ interestRateFromBalance.toFixed(2) }}% of balance
						</Flex>
					</span>
				</div>
			</Flex>
		</Flex>

		<Banner v-if="interestRateFromBalance >= 30" :class="$style.banner">
			{{
				(interestRateFromBalance >= 80 &&
					"Your stake is equal or close to the size of your entire balance") ||
				(interestRateFromBalance >= 50 &&
					"Your stake is half of your (or more) of the balance") ||
				(interestRateFromBalance >= 30 &&
					"Your stake is one-third (or more) of the balance")
			}}
		</Banner>

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
				type="primary"
				size="medium"
				block
				:disabled="!!timerInterval"
			>
				<Icon v-if="!timerInterval" name="check" size="16" />
				{{ timerInterval ? timer : "Confirm" }}
			</Button>
		</Flex>
	</Modal>
</template>

<style module>
.title {
	font-size: 20px;
	font-weight: 600;
	line-height: 1.2;
	color: var(--text-primary);

	margin-bottom: 8px;
}

.description {
	font-size: 14px;
	line-height: 1.6;
	font-weight: 500;
	color: var(--text-tertiary);

	margin-bottom: 40px;
}

.left {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.left span:nth-child(1) {
	font-size: 16px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-primary);
}

.left span:nth-child(2) {
	font-size: 13px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-tertiary);
	opacity: 0.5;
}

.right {
	display: flex;
	flex-direction: column;
	gap: 10px;
	align-items: flex-end;
}

.right span:nth-child(1) {
	font-size: 16px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-tertiary);
}

.right span b {
	font-weight: 600;
	color: var(--text-primary);
}

.right span:nth-child(2) {
	font-size: 13px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-tertiary);
}

.right span:nth-child(2).yellow {
	fill: var(--yellow);
	color: var(--yellow);
}

.right span:nth-child(2).red {
	fill: var(--red);
	color: var(--red);
}

.banner {
	margin-top: 20px;
}

.buttons {
	margin-top: 32px;
}
</style>
