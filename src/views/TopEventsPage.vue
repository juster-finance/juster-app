<script>
import { defineComponent } from "vue"

/**
 * Base
 */
import Page from "@base/Page.vue"

/**
 * Module
 */
import TopEventsBase from "@modules/events/TopEventsBase.vue"

export default defineComponent({
	name: "EventsPage",

	components: { Page, TopEventsBase },
})
</script>

<template>
	<Page>
		<TopEventsBase />
	</Page>
</template>

<style module>
.wrapper {
	max-width: 1250px;
}
</style>
