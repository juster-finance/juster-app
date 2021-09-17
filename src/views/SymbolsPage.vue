<script>
import { defineComponent } from "vue"

/**
 * Base
 */
import Page from "@/components/base/Page"

/**
 * Module
 */
import SymbolsBase from "@/components/modules/symbols/SymbolsBase"

export default defineComponent({
	name: "SymbolsPage",

	components: { Page, SymbolsBase },
})
</script>

<template>
	<Page>
		<SymbolsBase />
	</Page>
</template>

<style module>
.wrapper {
	max-width: 1250px;
}
</style>
