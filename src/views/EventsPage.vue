<script>
import { defineComponent } from "vue"

/**
 * Base
 */
import Page from "@base/Page.vue"

/**
 * Module
 */
import EventsBase from "@modules/events/EventsBase.vue"

export default defineComponent({
	name: "EventsPage",

	components: { Page, EventsBase },
})
</script>

<template>
	<Page>
		<EventsBase />
	</Page>
</template>

<style module>
.wrapper {
	max-width: 1250px;
}
</style>
