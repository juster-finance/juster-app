<script setup>
defineProps({
	icon: {
		type: String,
		default: "warning",
	},
	color: {
		type: String,
		default: "yellow",
	},
})
const emit = defineEmits(["onClose"])
</script>

<template>
	<Flex align="center" gap="16" :class="$style.wrapper">
		<Icon
			:name="icon"
			size="14"
			:class="[$style.general_icon, $style[color]]"
		/>

		<div :class="$style.content">
			<slot />
		</div>

		<Icon
			@click="emit('onClose')"
			name="close"
			size="14"
			:class="$style.close_icon"
		/>
	</Flex>
</template>

<style module>
.wrapper {
	border: 2px solid var(--border);
	border-radius: 8px;

	padding: 12px 16px;
}

.content {
	font-size: 12px;
	line-height: 19px;
	font-weight: 500;
	color: var(--text-secondary);
}

.content span {
	font-weight: 600;
	color: var(--text-primary);
}

.general_icon {
	box-sizing: content-box;
	border-radius: 50%;

	padding: 8px;
}

.general_icon.yellow {
	background: rgba(245, 183, 43, 0.15);
	fill: var(--yellow);
}

.close_icon {
	fill: var(--text-tertiary);
	cursor: pointer;

	transition: fill 0.2s ease;
}

.close_icon:hover {
	fill: var(--text-secondary);
}
</style>
