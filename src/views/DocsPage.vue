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
		<DocsBase :class="$style.wrapper" />
	</Page>
</template>

<style module>
.wrapper {
	user-select: text;
}
</style>
