<script>
import { defineComponent } from "vue"

/**
 * Base
 */
import Page from "@/components/base/Page"

/**
 * Module
 */
import ReleasesBase from "@/components/modules/releases/ReleasesBase"

export default defineComponent({
    name: "ReleasesPage",

    components: { Page, ReleasesBase },
})
</script>

<template>
    <Page>
        <ReleasesBase />
    </Page>
</template>
