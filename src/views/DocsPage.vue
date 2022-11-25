<script setup>
/**
 * Base
 */
import Page from "@base/Page.vue"

/**
 * Module
 */
import DocsBase from "@modules/docs/DocsBase.vue"
</script>

<template>
	<Page style="padding: 0">
		<DocsBase />
	</Page>
</template>

<style module>
.wrapper {
	max-width: 1250px;
	min-height: 100vh;
}
</style>
