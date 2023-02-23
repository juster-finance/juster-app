<script>
import { defineComponent } from "vue"

/**
 * Base
 */
import Page from "@base/Page.vue"

/**
 * Module
 */
import MarketBase from "@modules/symbols/MarketBase.vue"

export default defineComponent({
	name: "MarketPage",

	components: { Page, MarketBase },
})
</script>

<template>
	<Page>
		<MarketBase />
	</Page>
</template>

<style module>
.wrapper {
	max-width: 1250px;
}
</style>
