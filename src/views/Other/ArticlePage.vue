<script setup>
/**
 * Base
 */
import Page from "@base/Page.vue"

/**
 * Module
 */
import ArticleBase from "@modules/blog/ArticleBase.vue"
</script>

<template>
	<Page width="1080" :class="$style.wrapper">
		<ArticleBase />
	</Page>
</template>

<style module>
.wrapper {
	user-select: text;
}
</style>
