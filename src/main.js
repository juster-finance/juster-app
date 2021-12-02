import { createApp, provide, h } from "vue"
import { ApolloClients } from "@vue/apollo-composable"
import { createMetaManager } from "vue-meta"
import { apollo } from "@/apollo"
import { createPinia } from "pinia"

/** Analytics */
import VueGtag from "vue-gtag"
import amplitude from "amplitude-js"
amplitude.getInstance().init("a515d3d1969a8f25c340476842b19836")

/** Logging */
import * as Sentry from "@sentry/vue"
import { Integrations } from "@sentry/tracing"

/**
 * Firebase
 */
import { initializeApp } from "firebase/app"
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check"
const firebaseApp = initializeApp({
    apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
    authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VUE_APP_FIREBASE_MSG_SENDER_ID,
    appId: process.env.VUE_APP_FIREBASE_APP_ID,
})

const appCheck = initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaV3Provider(process.env.VUE_APP_RECAPTCHA_KEY),
    isTokenAutoRefreshEnabled: true,
})

/**
 * General
 */
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
app.use(VueGtag, { config: { id: "G-58LD5WNLR4" } })

/**
 * Provide
 */
app.provide("amplitude", amplitude.getInstance())
app.provide("firebaseApp", firebaseApp)

/** Logging Init */
Sentry.init({
    app,
    dsn: "https://a7417549147b41f2bad0065b5b5ebb3f@o189424.ingest.sentry.io/6077496",
    integrations: [
        new Integrations.BrowserTracing({
            routingInstrumentation: Sentry.vueRouterInstrumentation(router),
            tracingOrigins: ["app.juster.fi", /^\//],
        }),
    ],
    tracesSampleRate: 1.0,
})

/**
 * Global components
 */
import Icon from "@/components/icons/Icon"
app.component("Icon", Icon)

app.mount("#app")
