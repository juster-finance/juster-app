<script setup>
/**
 * Vendor
 */
import { ref, watch, computed } from "vue"
import { DateTime } from "luxon"

/**
 * UI
 */
import Modal from "@ui/Modal.vue"

/**
 * Services
 */
import { parsePoolName } from "@utils/misc"
import { juster, destroySubscription } from "@sdk"

/**
 * Models
 */
import { poolState as poolStateModel } from "@/graphql/models"

const props = defineProps({
	show: Boolean,
	pool: Object,
})

const emit = defineEmits(["onClose"])

const subscription = ref({})
const events = ref([])

const labelInterval = ref(null)
const delayBeforeNextEventLabel = ref("")

watch(
	() => events.value,
	() => {
		if (!events.value.length) return

		delayBeforeNextEventLabel.value = DateTime.now().diff(DateTime.fromISO(events.value[0].timestamp)).toFormat("hh:mm:ss")
		labelInterval.value = setInterval(() => {
			delayBeforeNextEventLabel.value = DateTime.now().diff(DateTime.fromISO(events.value[0].timestamp)).toFormat("hh:mm:ss")
		}, 1000)
	},
)

watch(
	() => props.show,
	async () => {
		if (props.show) {
			subscription.value = await juster.gql
				.subscription({
					poolState: [
						{
							where: {
								poolId: {
									_eq: props.pool.address,
								},
							},
							limit: 6,
							order_by: {
								counter: "desc",
							},
						},
						poolStateModel,
					],
				})
				.subscribe({
					next: ({ poolState }) => {
						events.value = poolState
					},
					error: console.error,
				})
		} else {
			destroySubscription(subscription.value)
			clearInterval(labelInterval.value)
		}
	},
)

const getEventIconByActionName = (action) => {
	if (action === "EVENT_CREATED") {
		return "plus_circle"
	}
	if (action === "EVENT_FINISHED") {
		return "flag"
	}
	if (action === "USER_DEPOSITED") {
		return "coins_plus"
	}
	if (action === "USER_CLAIMED") {
		return "checkcircle"
	}
	if (action === "USER_WITHDRAWN") {
		return "money"
	}
	if (action === "LIQUIDITY_APPROVED") {
		return "checkcircle"
	}

	return "help"
}
</script>

<template>
	<Modal new :show="show" width="550" closable disableTrap @onClose="emit('onClose')">
		<Flex align="center" justify="between" :class="$style.head">
			<Flex align="center" gap="8">
				<Icon name="time" size="16" color="secondary" />
				<Text size="14" weight="600" color="primary">Pool timeline</Text>
			</Flex>

			<Icon @click="emit('onClose')" name="close" size="16" color="tertiary" :class="$style.close_icon" />
		</Flex>

		<Flex direction="column" gap="32" :class="$style.base">
			<Text size="13" weight="500" color="tertiary" height="16">
				Your withdrawal request contains available claims. Funds will be available in your wallet as soon as all transactions are
				accepted.
			</Text>

			<Flex direction="column" gap="16">
				<Flex align="center" gap="12">
					<Text size="14" weight="600" color="primary">
						{{ parsePoolName(pool.name.replace("Juster Pool: ", "")) }}
					</Text>

					<Text size="12" weight="500" color="support"> ✦ </Text>

					<Flex align="center" gap="4">
						<Icon
							:name="!pool.isDepositPaused ? 'zap_circle' : 'pause'"
							size="12"
							:color="!pool.isDepositPaused ? 'green' : 'yellow'"
						/>
						<Text size="12" weight="600" :color="!pool.isDepositPaused ? 'green' : 'yellow'">
							{{ !pool.isDepositPaused ? "Active" : "Paused" }}
						</Text>
					</Flex>
				</Flex>

				<div :class="$style.divider" />
			</Flex>

			<Flex direction="column" gap="12">
				<Flex v-if="events.length" align="center" gap="16">
					<Text size="14" weight="500" color="tertiary" align="right" :class="$style.when">{{ delayBeforeNextEventLabel }}</Text>

					<Flex align="center" gap="8">
						<div :class="$style.dot" />

						<Text size="14" weight="500" color="tertiary"> Waiting for next event... </Text>
					</Flex>
				</Flex>

				<div :class="$style.test" />

				<Flex v-for="(ev, idx) in events" direction="column" gap="12">
					<Flex align="center" gap="16">
						<Text size="14" weight="500" color="tertiary" align="right" :class="$style.when">
							{{ DateTime.fromISO(ev.timestamp).toFormat("hh:mm") }}
						</Text>

						<Flex align="center" gap="8">
							<Icon :name="getEventIconByActionName(ev.action)" size="14" color="secondary" />

							<Text size="14" weight="600" color="primary" :class="$style.action_name">
								{{ ev.action.toLowerCase().replace("_", " ") }}
							</Text>
						</Flex>
					</Flex>

					<div v-if="idx !== events.length - 1" :class="$style.test" />
				</Flex>
			</Flex>
		</Flex>
	</Modal>
</template>

<style module>
.head {
	height: 56px;

	padding: 0 20px;
}

.close_icon {
	cursor: pointer;
}

.base {
	padding: 0px 20px 20px 20px;
	margin-bottom: 16px;
}

.divider {
	width: 100%;
	height: 0px;

	border: 1px dashed var(--opacity-05);
}

.when {
	min-width: 80px;
}

.action_name {
	text-transform: capitalize;
}

.dot {
	width: 4px;
	height: 4px;
	border-radius: 50px;
	background: var(--text-secondary);

	margin: 0 5px;

	box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.5);
	transform: scale(1);
	animation: pulse 2s infinite;
}

@keyframes pulse {
	0% {
		transform: scale(0.95);
		box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.5);
	}

	70% {
		transform: scale(1);
		box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
	}

	100% {
		transform: scale(0.95);
		box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
	}
}

.test {
	width: 2px;
	height: 24px;

	background: var(--opacity-05);

	margin-left: 102px;
}
</style>
