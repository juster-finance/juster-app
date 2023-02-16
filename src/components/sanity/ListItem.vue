<script setup>
const props = defineProps({
	listItem: String,
	level: Number,
	text: String,
})
</script>

<template>
	<Flex gap="12" :class="$style.wrapper">
		<div
			:style="{ marginLeft: `${(level - 1) * 20}px`, opacity: 1 / level }"
		>
			<Icon
				v-if="listItem === 'check'"
				name="verified"
				size="20"
				color="green"
			/>
			<div v-else="listItem === 'bullet'" :class="[$style.line]" />
		</div>

		<Text size="16" weight="500" color="secondary" height="16">
			{{ text }}
		</Text>
	</Flex>
</template>

<style module>
.wrapper {
	width: 100%;
}

.wrapper svg {
	margin-top: 2px;
}

.line {
	width: 12px;
	height: 1px;
	background: var(--text-tertiary);

	margin-top: 10px;
}
</style>
