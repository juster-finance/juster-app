<script>
import { defineComponent } from "vue"

/**
 * Base
 */
import Page from "@/components/base/Page"

/**
 * Module
 */
import DocsBase from "@/components/modules/docs/DocsBase"

export default defineComponent({
    name: "DocsPage",

    components: { Page, DocsBase },
})
</script>

<template>
    <Page style="padding: 0; margin-bottom: 0">
        <DocsBase />
    </Page>
</template>

<style module>
.wrapper {
    max-width: 1250px;
}
</style>
