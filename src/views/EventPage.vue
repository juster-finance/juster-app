<script>
import { defineComponent } from "vue"

/**
 * Base
 */
import Page from "@/components/base/Page"

/**
 * Module
 */
import EventBase from "@/components/modules/event/EventBase"

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
