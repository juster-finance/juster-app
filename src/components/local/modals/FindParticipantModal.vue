<script setup>
/** Vendor */
import { computed, ref, watch } from "vue"

/**
 * Components: UI
 */
import Modal from "@ui/Modal.vue"
import Input from "@ui/Input.vue"
import Button from "@ui/Button.vue"

const props = defineProps({
	show: {
		type: Boolean,
		default: false,
	},
})

const emit = defineEmits(["onAdd"])

const address = ref("")

const buttonState = computed(() => {
	if (address.value.length < 36)
		return { text: "Type account address", isDisabled: true }
	if (address.value.length !== 36)
		return { text: "Invalid length", isDisabled: true }
	if (!address.value.startsWith("tz"))
		return { text: "Invalid address format", isDisabled: true }

	return { text: "Add user", isDisabled: false }
})

const handleAdd = () => {
	if (buttonState.value.isDisabled) return

	emit("onAdd", address.value)
}

watch(
	() => props.show,
	() => {
		if (!props.show) {
			address.value = ""
		}
	},
)
</script>

<template>
	<Modal :show="show" width="500" closable @onClose="$emit('onClose')">
		<div :class="$style.title">Add participant</div>

		<Input
			type="text"
			v-model="address"
			label="Address"
			placeholder="Type user address"
			:class="$style.input"
		/>

		<Button
			@click="handleAdd"
			:type="buttonState.isDisabled ? 'secondary' : 'primary'"
			size="large"
			:disabled="buttonState.isDisabled"
			block
			>{{ buttonState.text }}</Button
		>
	</Modal>
</template>

<style module>
.title {
	font-size: 20px;
	font-weight: 600;
	line-height: 1.2;
	color: var(--text-primary);

	margin-bottom: 24px;
}

.input {
	margin-bottom: 24px;
}
</style>
