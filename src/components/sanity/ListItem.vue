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

		<Text size="16" weight="500" color="secondary" height="18">
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
	width: 8px;
	height: 2px;
	background: var(--text-support);

	margin-top: 12px;
}
</style>
