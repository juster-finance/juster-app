<script>
import { defineComponent } from "vue"

/**
 * Base
 */
import Page from "@/components/base/Page"

/**
 * Module
 */
import WithdrawalsBase from "@/components/modules/profile/WithdrawalsBase"

export default defineComponent({
    name: "WithdrawalsPage",

    components: { Page, WithdrawalsBase },
})
</script>

<template>
    <Page>
        <WithdrawalsBase />
    </Page>
</template>
