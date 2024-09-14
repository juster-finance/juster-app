/* eslint-disable vue/multi-word-component-names */
import { createApp, h } from "vue"
import { createMetaManager } from "vue-meta"
import { createPinia } from "pinia"

/** Analytics */
import VueGtag from "vue-gtag"
import amplitude from "amplitude-js"
amplitude.getInstance().init(import.meta.env.VITE_AMPLITUDE)

import "@sdk"

import { initFlags } from "@/services/flags"
initFlags()

import App from "./TonApp.vue"
import router from "./router"

const app = createApp({
	render: () => h(App),
})

/**
 * Use
 */
app.use(router)
app.use(createPinia())
app.use(createMetaManager())
app.use(VueGtag, { config: { id: "G-58LD5WNLR4" } })

/**
 * Provide
 */
app.provide("amplitude", amplitude.getInstance())

/**
 * Global components
 */
import Icon from "@/components/icons/Icon.vue"
import TokenSymbol from "@/components/icons/TokenSymbol.vue"
import Flex from "@layout/Flex.vue"
import Text from "@typography/Text.vue"
app.component("Icon", Icon)
app.component("TokenSymbol", TokenSymbol)
app.component("Flex", Flex)
app.component("Text", Text)

app.mount("#app")
