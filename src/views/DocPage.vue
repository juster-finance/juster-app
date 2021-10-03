<script>
import { defineComponent } from "vue"

/**
 * Base
 */
import Page from "@/components/base/Page"

/**
 * Module
 */
import DocBase from "@/components/modules/docs/DocBase"

export default defineComponent({
    name: "DocPage",

    components: { Page, DocBase },
})
</script>

<template>
    <Page style="padding: 0; margin-bottom: 0">
        <DocBase />
    </Page>
</template>

<style module>
.wrapper {
    max-width: 1250px;
}
</style>
