<script>
import { defineComponent } from "vue"

/**
 * Base
 */
import Page from "@base/Page.vue"

/**
 * Module
 */
import EventBase from "@modules/event/EventBase.vue"

export default defineComponent({
	name: "EventPage",

	components: { Page, EventBase },
})
</script>

<template>
	<Page>
		<EventBase />
	</Page>
</template>

<style module>
.wrapper {
	max-width: 1250px;
}
</style>
