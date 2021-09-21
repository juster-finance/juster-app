<script>
import { defineComponent } from "vue"

/**
 * Base
 */
import Page from "@/components/base/Page"

/**
 * Module
 */
import SymbolBase from "@/components/modules/symbols/SymbolBase"

export default defineComponent({
    name: "SymbolPage",

    components: { Page, SymbolBase },
})
</script>

<template>
    <Page>
        <SymbolBase />
    </Page>
</template>

<style module>
.wrapper {
    max-width: 1250px;
}
</style>
