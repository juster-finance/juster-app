<script>
import { defineComponent } from "vue"

/**
 * Base
 */
import Page from "@/components/base/Page"

/**
 * Module
 */
import MarketBase from "@/components/modules/symbols/MarketBase"

export default defineComponent({
    name: "MarketPage",

    components: { Page, MarketBase },
})
</script>

<template>
    <Page>
        <MarketBase />
    </Page>
</template>

<style module>
.wrapper {
    max-width: 1250px;
}
</style>
