<script setup>
/**
 * Vendor
 */
import { ref } from "vue"

const props = defineProps({
	title: String,
	description: String,
})

const isExpanded = ref(false)
</script>

<template>
	<Flex
		@click="isExpanded = !isExpanded"
		direction="column"
		gap="16"
		:class="$style.wrapper"
	>
		<Flex justify="between" align="center">
			<Text size="14" weight="600" color="secondary">
				{{ title }}
			</Text>

			<Icon name="arrow" size="16" color="secondary" />
		</Flex>

		<Text
			v-if="isExpanded"
			size="14"
			height="16"
			weight="500"
			color="tertiary"
		>
			{{ description }}
		</Text>
	</Flex>
</template>

<style module>
.wrapper {
	width: 100%;
	border-radius: 8px;
	cursor: pointer;

	background: rgba(255, 255, 255, 0.05);
	border: 1px solid var(--border);

	padding: 16px;
	margin-bottom: 40px;

	transition: all 0.2s ease;
}

.wrapper:hover {
	background: rgba(255, 255, 255, 0.08);
}
</style>
