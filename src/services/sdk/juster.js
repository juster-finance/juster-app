import { computed, reactive } from "vue"
import { Juster } from "@juster-finance/sdk"
import { createClient } from "@juster-finance/gql-client"
import {
    ApolloClient,
    InMemoryCache,
    HttpLink,
    from,
} from "@apollo/client/core"

import { dipdup } from "@/services/config"

/**
 * Services.Constants
 */
import { Networks } from "@/services/constants"

/**
 * Store
 */
const juster = reactive({ sdk: null, gql: null, apollo: null })

const currentNetwork = computed(() => juster.sdk._network)

/**
 * Storage "activeNetwork"
 */
if (!localStorage.activeNetwork) {
    localStorage.activeNetwork = Networks.MAINNET
}

/**
 * Validate "activeNetwork" (Integrity Repair)
 */
if (
    ![Networks.MAINNET, Networks.TESTNET].includes(localStorage.activeNetwork)
) {
    localStorage.activeNetwork = Networks.MAINNET
}

/**
 * Init
 */

/** SDK */
juster.sdk = Juster.create(localStorage.activeNetwork)

/** GQL */
juster.gql = createClient({
    url: dipdup[currentNetwork.value].graphq,
    subscription: { url: dipdup[currentNetwork.value].ws },
})

/** Apollo */
const link = from([new HttpLink({ uri: dipdup[currentNetwork.value].graphq })])
juster.apollo = new ApolloClient({
    link,
    cache: new InMemoryCache(),
    connectToDevTools: true,
})

/**
 * Switch between Networks
 */
const switchNetwork = network => {
    if (![Networks.MAINNET, Networks.TESTNET].includes(network)) return

    /** todo (Settings): switch temporarily (without saving in LS) */
    localStorage.activeNetwork = network

    location.reload()
}

export { juster, currentNetwork, switchNetwork }
