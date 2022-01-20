<script>
import { defineComponent } from "vue"

/**
 * Base
 */
import Page from "@/components/base/Page"

/**
 * Module
 */
import MarketsBase from "@/components/modules/symbols/MarketsBase"

export default defineComponent({
    name: "MarketsPage",

    components: { Page, MarketsBase },
})
</script>

<template>
    <Page>
        <MarketsBase />
    </Page>
</template>

<style module>
.wrapper {
    max-width: 1250px;
}
</style>
