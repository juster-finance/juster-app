<script setup>
import { ref, onMounted } from "vue"

/**
 * Local
 */
import UserCard from "@local/UserCard.vue"

/**
 * UI
 */
import Modal from "@ui/Modal.vue"

/**
 * API
 */
import { fetchEventParticipants } from "@/api/events"

const emit = defineEmits(["onClose"])
const props = defineProps({
	show: Boolean,
	event: { type: Object, default: () => {} },
})

const users = ref([])

onMounted(async () => {
	users.value = await fetchEventParticipants({ id: props.event.id })
})
</script>

<template>
	<Modal :show="show" width="500" new closable @onClose="$emit('onClose')">
		<Flex align="center" justify="between" :class="$style.head">
			<Flex align="center" gap="8">
				<Icon name="users" size="16" color="secondary" />
				<Text size="14" weight="600" color="primary">
					Participants
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

		<Flex direction="column" gap="24" :class="$style.base">
			<Flex direction="column" gap="10">
				<div :class="$style.subtitle">Creator</div>
				<div :class="$style.users">
					<UserCard
						:user="{ userId: event.creatorId, creator: true }"
						:class="$style.user"
					/>
				</div>
			</Flex>

			<Flex direction="column" gap="10">
				<div :class="$style.subtitle">
					Users who participate <span>{{ users.length }}</span>
				</div>
				<div v-if="users.length" :class="$style.users">
					<UserCard
						v-for="user in users"
						:key="user.id"
						:user="user"
						:class="$style.user"
					/>
				</div>
				<div v-else :class="$style.empty">
					<Icon name="help" size="16" /> Wait for the initial
					liquidity to be provided
				</div>
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
	padding: 8px 20px 20px 20px;
}

.subtitle {
	display: flex;
	justify-content: space-between;

	font-size: 13px;
	font-weight: 600;
	color: var(--text-tertiary);
}

.users {
	display: flex;
	flex-direction: column;
	gap: 8px;

	max-height: 400px;
	overflow-y: auto;
}

.empty {
	display: flex;
	align-items: center;
	gap: 8px;

	font-size: 14px;
	line-height: 1.6;
	color: var(--text-secondary);
	fill: var(--text-tertiary);
}
</style>
