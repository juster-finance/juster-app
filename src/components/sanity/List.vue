<script setup>
import ListItem from "./ListItem.vue"

const props = defineProps({
	children: Array,
})
</script>

<template>
	<Flex direction="column" gap="24" :class="$style.wrapper">
		<ListItem
			v-for="item in children"
			:text="item.children[0].text"
			:level="item.level"
			:list-item="item.listItem"
		/>
	</Flex>
</template>

<style module>
.wrapper {
	width: 100%;

	margin-bottom: 40px;
}
</style>
