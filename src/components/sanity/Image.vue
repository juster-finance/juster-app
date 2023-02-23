<script setup>
const props = defineProps({
	asset: Object,
	alt: String,
	desc: String,
})
</script>

<template>
	<Flex direction="column" gap="16" align="center" :class="$style.wrapper">
		<img :src="`${asset.url}?auto=format`" :alt="alt" loading="lazy" />

		<Text size="12" color="tertiary" weight="500">{{ desc }}</Text>
	</Flex>
</template>

<style module>
.wrapper {
	margin-bottom: 40px;
}

.wrapper img {
	max-width: 100%;

	border-radius: 12px;
}
</style>
