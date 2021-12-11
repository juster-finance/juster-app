<script>
import { defineComponent } from "vue"

/**
 * Base
 */
import Page from "@/components/base/Page"

/**
 * Module
 */
import ReleaseBase from "@/components/modules/releases/ReleaseBase"

export default defineComponent({
    name: "ReleasePage",

    components: { Page, ReleaseBase },
})
</script>

<template>
    <Page>
        <ReleaseBase />
    </Page>
</template>
