<script setup>
const props = defineProps({
	url: String,
})
</script>

<template>
	<router-link :to="url">
		<slot />
	</router-link>
</template>
