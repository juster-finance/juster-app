/**
 * Vendor
 */
import { computed, reactive } from "vue"
import { JusterDemo } from "@juster-finance/sdk"
import { createClient } from "@juster-finance/gql-client"
import { BeaconWallet } from "@taquito/beacon-wallet"
import { TezosToolkit } from "@taquito/taquito"

import { dipdup, rpcNodes, demoMode, localStorageKeys } from "@config"
import axios from "axios"

/**
 * Services.Constants
 */
import { Networks } from "@/services/constants"

/**
 * Store
 */
const juster = reactive({
	sdk: null,
	gql: null,
	tezos: null,
	provider: null,

	pools: {},
})

const defaultNetwork = Networks.MAINNET;
// TODO: #1
// const currentNetwork = computed(() => (juster.sdk._network === "mainnet" ? "mainnet" : "testnet"))
const currentNetwork = computed(() => defaultNetwork)
/**
 * Storage "activeNetwork"
 */
if (!localStorage.activeNetwork) {
	localStorage.activeNetwork = defaultNetwork
}

/**
 * Validate "activeNetwork" (Integrity Repair)
 */
if (![Networks.MAINNET, Networks.TESTNET].includes(localStorage.activeNetwork)) {
	localStorage.activeNetwork = defaultNetwork
}

juster.provider = new BeaconWallet({
	name: "Juster",
	preferredNetwork: localStorage.activeNetwork,
})

juster.tezos = new TezosToolkit(rpcNodes[localStorage.activeNetwork][0].url)

const init = async () => {
	juster.sdk = new JusterDemo({
		baseUrl: demoMode.baseUrl,
		accessTokenFactory: () => localStorage.getItem(localStorageKeys.AUTH_TOKEN)
	})

	/** GQL */
	juster.gql = createClient({
		url: dipdup[currentNetwork.value].graphq,
		subscription: { url: dipdup[currentNetwork.value].ws },
	})
}
init()

const initPools = (pools) => {
	const poolAddresses = pools.map((pool) => pool.address)

	poolAddresses.forEach((pool) => {
		juster.pools[pool] = JusterPool.create(juster.tezos, juster.provider, localStorage.activeNetwork, pool)
	})
}

/**
 * Switch between Networks
 */
const switchNetwork = (network, router) => {
	if (![Networks.MAINNET, Networks.TESTNET].includes(network)) return

	/** todo (Settings): switch temporarily (without saving in LS) */
	localStorage.activeNetwork = network

	init()

	router.push("/")
}

export const executeGqlQuery = async (query) => {
    const result = await axios({
        url: dipdup[currentNetwork.value].graphq,
        method: "POST",
        data: {
          query,
        },
      });

    return result.data.data
}

/**
 * Utils
 */
const destroySubscription = (sub) => {
	if (Object.prototype.hasOwnProperty.call(sub, "_state") && !sub?.closed) {
		sub.unsubscribe()
	}
}

export { juster, currentNetwork, switchNetwork, initPools, destroySubscription }
