<script setup>
/**
 * Base
 */
import Page from "@base/Page.vue"

/**
 * Module
 */
import WelcomeBase from "@modules/welcome/WelcomeBase.vue"
</script>

<template>
	<Page>
		<WelcomeBase :class="$style.wrapper" />
	</Page>
</template>

<style module>
.wrapper {
	max-width: 1250px;
	height: 100vh;
}
</style>
