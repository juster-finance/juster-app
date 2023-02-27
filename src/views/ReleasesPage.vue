<script>
import { defineComponent } from "vue"

/**
 * Base
 */
import Page from "@base/Page.vue"

/**
 * Module
 */
import ReleasesBase from "@modules/releases/ReleasesBase.vue"

export default defineComponent({
	name: "ReleasesPage",

	components: { Page, ReleasesBase },
})
</script>

<template>
	<Page :class="$style.wrapper">
		<ReleasesBase />
	</Page>
</template>

<style module>
.wrapper {
	user-select: text;
}
</style>
