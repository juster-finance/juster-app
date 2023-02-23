<script setup>
const props = defineProps({
	name: {
		type: String,
	},
	selected: {
		type: Boolean,
	},
	disabled: {
		type: Boolean,
	},
})
</script>

<template>
	<Flex
		align="center"
		justify="between"
		gap="8"
		:class="[$style.item, disabled && $style.disabled]"
		tabindex="1"
	>
		<Flex align="center" gap="8">
			<Icon
				v-if="!disabled"
				:name="selected ? 'event_active' : 'event_new'"
				size="16"
				:color="selected ? 'blue' : 'tertiary'"
			/>
			<Icon v-else name="lock" size="16" color="tertiary" />

			<Text size="13" weight="600" color="primary">{{ name }}</Text>
		</Flex>

		<slot name="hint" />
	</Flex>
</template>

<style module>
.item {
	width: 100%;
	height: 32px;

	border-radius: 6px;
	background: rgba(255, 255, 255, 0.05);
	cursor: pointer;

	padding: 0 12px;

	transition: all 0.2s ease;
}

.item:focus {
	outline: none;
	box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
}

.item.disabled {
	opacity: 0.5;
	pointer-events: none;
}
</style>
