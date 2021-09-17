import { createApp, provide, h } from "vue"
import { ApolloClients } from "@vue/apollo-composable"
import { createMetaManager } from "vue-meta"
import { apollo } from "@/apollo"
import { createPinia } from "pinia"

import "@/services/tools"
import App from "./App.vue"
import router from "./router"

const app = createApp({
    setup() {
        provide(ApolloClients, {
            default: apollo,
        })
    },

    render: () => h(App),
})

/**
 * Use
 */
app.use(router)
app.use(createPinia())
app.use(createMetaManager())

/**
 * Global components
 */
import Icon from "@/components/icons/Icon"
app.component("Icon", Icon)

app.mount("#app")
