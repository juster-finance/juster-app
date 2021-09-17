<script>
import { defineComponent } from "vue"

/**
 * Base
 */
import Page from "@/components/base/Page"

/**
 * Module
 */
import ObserveBase from "@/components/modules/observe/ObserveBase"

export default defineComponent({
	name: "ObservePage",

	components: { Page, ObserveBase },
})
</script>

<template>
	<Page>
		<ObserveBase />
	</Page>
</template>

<style module>
.wrapper {
	max-width: 1250px;
}
</style>
