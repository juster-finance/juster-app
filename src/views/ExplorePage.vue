<script>
import { defineComponent } from "vue"

/**
 * Base
 */
import Page from "@base/Page.vue"

/**
 * Module
 */
import ExploreBase from "@modules/explore/ExploreBase.vue"

export default defineComponent({
	name: "ExplorePage",

	components: { Page, ExploreBase },
})
</script>

<template>
	<Page>
		<ExploreBase />
	</Page>
</template>

<style module>
.wrapper {
	max-width: 1250px;
}
</style>
