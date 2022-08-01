/** Vendor */
import { computed, reactive } from "vue"
import { Juster } from "@juster-finance/sdk"
import { createClient } from "@juster-finance/gql-client"
import {
	ApolloClient,
	InMemoryCache,
	HttpLink,
	from,
} from "@apollo/client/core"
import { BeaconWallet } from "@taquito/beacon-wallet"
import { TezosToolkit } from "@taquito/taquito"

import { dipdup, rpcNodes } from "@/services/config"

/**
 * Services.Constants
 */
import { Networks } from "@/services/constants"

/**
 * Store
 */
const juster = reactive({ sdk: null, gql: null, apollo: null, tezos: null })

const currentNetwork = computed(() =>
	juster.sdk._network === "mainnet" ? "mainnet" : "testnet",
)

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

const beaconWallet = new BeaconWallet({
	name: "Juster",
	preferredNetwork: localStorage.activeNetwork,
})
juster.tezos = new TezosToolkit(rpcNodes[localStorage.activeNetwork][0].url)

const init = () => {
	juster.sdk = Juster.create(
		juster.tezos,
		beaconWallet,
		localStorage.activeNetwork,
	)

	/** GQL */
	juster.gql = createClient({
		url: dipdup[currentNetwork.value].graphq,
		subscription: { url: dipdup[currentNetwork.value].ws },
	})

	/** Apollo */
	const link = from([
		new HttpLink({ uri: dipdup[currentNetwork.value].graphq }),
	])
	juster.apollo = new ApolloClient({
		link,
		cache: new InMemoryCache(),
		connectToDevTools: true,
	})
}
init()

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

export { juster, currentNetwork, switchNetwork }
