<script>
import { defineComponent } from "vue"

/**
 * Base
 */
import Page from "@/components/base/Page"

/**
 * Module
 */
import ProfileBase from "@/components/modules/profile/ProfileBase"

export default defineComponent({
    name: "ProfilePage",

    components: { Page, ProfileBase },
})
</script>

<template>
    <Page>
        <ProfileBase />
    </Page>
</template>
