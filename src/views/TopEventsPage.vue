<script>
import { defineComponent } from "vue"

/**
 * Base
 */
import Page from "@/components/base/Page"

/**
 * Module
 */
import TopEventsBase from "@/components/modules/events/TopEventsBase"

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
