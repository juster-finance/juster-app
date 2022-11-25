<script>
import { defineComponent } from "vue"

/**
 * Base
 */
import Page from "@base/Page.vue"

/**
 * Module
 */
import ReleaseBase from "@modules/releases/ReleaseBase.vue"

export default defineComponent({
	name: "ReleasePage",

	components: { Page, ReleaseBase },
})
</script>

<template>
	<Page>
		<ReleaseBase />
	</Page>
</template>
