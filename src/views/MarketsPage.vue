<script>
import { defineComponent } from "vue"

/**
 * Base
 */
import Page from "@base/Page.vue"

/**
 * Module
 */
import MarketsBase from "@modules/symbols/MarketsBase.vue"

export default defineComponent({
	name: "MarketsPage",

	components: { Page, MarketsBase },
})
</script>

<template>
	<Page>
		<MarketsBase />
	</Page>
</template>

<style module>
.wrapper {
	max-width: 1250px;
}
</style>
