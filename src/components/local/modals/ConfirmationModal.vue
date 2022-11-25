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
	appStore.confirmation.callback()
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
		<div :class="$style.title">
			{{ appStore.confirmation.title }}
		</div>
		<div :class="$style.description">
			{{ appStore.confirmation.description }}
		</div>

		<Flex gap="16" :class="$style.buttons">
			<Button
				@click="appStore.cancelConfirmation()"
				type="secondary"
				size="small"
				block
			>
				Cancel
			</Button>
			<Button @click="handleConfirm" type="primary" size="small" block
				>Confirm</Button
			>
		</Flex>
	</Modal>
</template>

<style module>
.title {
	font-size: 15px;
	font-weight: 500;
	line-height: 1.2;
	color: var(--text-primary);

	margin-bottom: 8px;
}

.description {
	font-size: 14px;
	line-height: 1.6;
	font-weight: 500;
	color: var(--text-tertiary);

	margin-bottom: 24px;
}
</style>
