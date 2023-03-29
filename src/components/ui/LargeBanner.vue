<script setup>
/**
 * Vendor
 */
import { useSlots } from "vue"

defineProps({
	title: String,
	description: String,
	icon: Object,
})

const slots = useSlots()
</script>

<template>
	<Flex gap="12" :class="$style.wrapper">
		<Icon :name="icon.name" size="16" :color="icon.color" />

		<Flex direction="column" gap="16">
			<Flex direction="column" gap="4">
				<Text size="14" weight="600" height="14" color="primary">
					{{ title }}
				</Text>
				<Text size="13" weight="500" color="tertiary" height="16">
					{{ description }}
				</Text>
			</Flex>

			<Flex v-if="slots.buttons" align="center" gap="16">
				<slot name="buttons" />
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	background: var(--app-bg);
	border-radius: 8px;

	padding: 16px;
}
</style>
