<script setup>
/** Vendor */
// import { ref } from "vue"

/**
 * UI
 */
import Modal from "@ui/Modal.vue"
import Button from "@ui/Button.vue"

/**
 * Store
 */
import { useAppStore } from "@store/app"

defineProps({
	show: Boolean,
})

const appStore = useAppStore()

const handleConfirm = () => {
	appStore.confirmation.confirmCb()
}
const handleCancel = () => {
	appStore.confirmation.cancelCb()
}
</script>

<template>
	<Modal
		:show="show"
		width="500"
		required
		z-index="1005"
		@onClose="$emit('onClose')"
	>
		<Flex direction="column" gap="24">
			<Flex direction="column" gap="12">
				<Text size="14" weight="600" color="primary">
					{{ appStore.confirmation.title }}
				</Text>
				<Text size="14" weight="500" color="tertiary" height="16">
					{{ appStore.confirmation.description }}
				</Text>
			</Flex>

			<Flex
				v-if="appStore.confirmation.badges.length"
				direction="column"
				gap="32"
			>
				<Flex direction="column" gap="16">
					<Flex
						v-for="badge in appStore.confirmation.badges"
						align="center"
						gap="8"
					>
						<Icon
							:name="badge.icon.name"
							size="14"
							:color="badge.icon.color"
						/>
						<Text
							size="13"
							weight="500"
							color="secondary"
							height="12"
						>
							{{ badge.name }}
						</Text>
					</Flex>
				</Flex>

				<div :class="$style.divider" />
			</Flex>

			<Flex
				v-if="appStore.confirmation.metadata"
				gap="16"
				:class="$style.buttons"
			>
				<Button
					@click="handleCancel"
					:type="
						appStore.confirmation.metadata?.buttons.cancel.type
							? appStore.confirmation.metadata?.buttons.cancel
									.type
							: 'secondary'
					"
					size="small"
					block
				>
					<Icon
						v-if="
							appStore.confirmation.metadata?.buttons.cancel.icon
						"
						:name="
							appStore.confirmation.metadata?.buttons.cancel.icon
						"
						size="16"
						color="secondary"
					/>
					{{ appStore.confirmation.metadata?.buttons.cancel.title }}
				</Button>
				<Button
					@click="handleConfirm"
					:type="
						appStore.confirmation.metadata?.buttons.confirm.type
							? appStore.confirmation.metadata?.buttons.confirm
									.type
							: 'primary'
					"
					size="small"
					block
				>
					<Icon
						v-if="
							appStore.confirmation.metadata?.buttons.confirm.icon
						"
						:name="
							appStore.confirmation.metadata?.buttons.confirm.icon
						"
						size="16"
						color="secondary"
					/>
					{{ appStore.confirmation.metadata?.buttons.confirm.title }}
				</Button>
			</Flex>
			<Flex v-else gap="16" :class="$style.buttons">
				<Button
					@click="appStore.cancelConfirmation()"
					type="secondary"
					size="small"
					block
				>
					Cancel
				</Button>
				<Button
					@click="handleConfirm"
					type="primary"
					size="small"
					block
				>
					Confirm
				</Button>
			</Flex>
		</Flex>
	</Modal>
</template>

<style module>
.divider {
	width: 100%;
	height: 1px;
	background: var(--border);
}
</style>
