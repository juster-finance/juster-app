<script>
import { defineComponent } from "vue"

/**
 * Base
 */
import Page from "@/components/base/Page"

/**
 * Module
 */
import EventsBase from "@/components/modules/events/EventsBase"

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
