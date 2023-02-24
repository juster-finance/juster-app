<script setup>
/**
 * Base
 */
import Page from "@base/Page.vue"

/**
 * Module
 */
import BlogBase from "@modules/blog/BlogBase.vue"
</script>

<template>
	<Page width="1080" :class="$style.wrapper">
		<BlogBase />
	</Page>
</template>

<style module>
.wrapper {
	user-select: text;
}
</style>
