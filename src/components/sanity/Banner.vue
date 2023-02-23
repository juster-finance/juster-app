<script setup>
const props = defineProps({
	type: String,
	title: String,
	description: String,
})
</script>

<template>
	<Flex
		direction="column"
		gap="12"
		:class="[
			$style.wrapper,
			(type === 'warning' && $style.warning) ||
				(type === 'danger' && $style.danger) ||
				$style.information,
		]"
	>
		<Icon
			:name="
				(type === 'warning' && 'warning') ||
				(type === 'danger' && 'warning') ||
				'help'
			"
			size="20"
		/>

		<Text size="14" height="16" weight="500">
			{{ description }}
		</Text>
	</Flex>
</template>

<style module>
.wrapper {
	border-radius: 12px;

	padding: 16px;
	margin-bottom: 40px;
}

.wrapper.information {
	fill: var(--text-tertiary);
	color: var(--text-secondary);
	background: rgba(255, 255, 255, 0.05);

	border: 1px solid var(--border);
}

.wrapper.warning {
	fill: var(--yellow);
	color: var(--text-secondary);
	background: rgba(255, 255, 255, 0.05);

	border: 1px solid var(--border);
}

.wrapper.danger {
	fill: var(--red);
	color: var(--text-secondary);
	background: rgba(255, 255, 255, 0.05);

	border: 1px solid var(--border);
}
</style>
