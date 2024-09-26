<script setup>
/** Vendor */
import { computed, ref, watch } from "vue"

/**
 * Components: UI
 */
import Modal from "@ui/Modal.vue"
import Input from "@ui/Input.vue"
import Button from "@ui/Button.vue"
import { checkIfValidAddress } from "@utils/address"

const emit = defineEmits(["onAdd", "onClose"])
const props = defineProps({
	show: {
		type: Boolean,
		default: false,
	},
})

const address = ref("")

const buttonState = computed(() => {
	if (!checkIfValidAddress(address.value))
		return { text: "Invalid address", isDisabled: true }

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
	<Modal :show="show" width="500" new closable @onClose="emit('onClose')">
		<Flex align="center" justify="between" :class="$style.head">
			<Flex align="center" gap="8">
				<Icon name="search" size="16" color="secondary" />

				<Text size="14" weight="600" color="primary"> Find user </Text>
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
			>
				{{ buttonState.text }}
			</Button>
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
</style>
