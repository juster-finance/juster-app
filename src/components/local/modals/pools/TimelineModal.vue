<script setup>
/**
 * Vendor
 */
import { ref, watch } from "vue"

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
									_eq: props.pool.id,
								},
							},
							limit: 10,
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
		}
	},
)
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

			<div v-for="event in events">
				{{ event.action }}
			</div>
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
</style>
