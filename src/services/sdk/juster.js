/** Vendor */
import { computed, reactive } from "vue"
import { JusterCore, JusterPool } from "@juster-finance/sdk"
import { createClient } from "@juster-finance/gql-client"
import { ApolloClient, InMemoryCache } from "@apollo/client/core"
import { WebSocketLink } from "apollo-link-ws"
import { BeaconWallet } from "@taquito/beacon-wallet"
import { TezosToolkit } from "@taquito/taquito"

import { dipdup, rpcNodes } from "@config"

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
	apollo: null,
	tezos: null,
	pools: {},
})

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
	juster.sdk = JusterCore.create(
		juster.tezos,
		beaconWallet,
		localStorage.activeNetwork,
	)

	// juster.pool = JusterPool.create(
	// 	juster.tezos,
	// 	beaconWallet,
	// 	localStorage.activeNetwork,
	// )

	/** GQL */
	juster.gql = createClient({
		url: dipdup[currentNetwork.value].graphq,
		subscription: { url: dipdup[currentNetwork.value].ws },
	})

	/** Apollo */
	// const link = from([
	// 	new HttpLink({ uri: dipdup[currentNetwork.value].graphq }),
	// ])
	const wsLink = new WebSocketLink({
		uri: dipdup[currentNetwork.value].ws,
		options: {
			reconnect: true,
		},
		webSocketImpl: WebSocket,
	})
	juster.apollo = new ApolloClient({
		link: wsLink,
		cache: new InMemoryCache(),
		connectToDevTools: true,
	})
}
init()

const initPools = (pools) => {
	const poolAddresses = pools.map((pool) => pool.address)

	poolAddresses.forEach((pool) => {
		juster.pools[pool] = JusterPool.create(
			juster.tezos,
			beaconWallet,
			localStorage.activeNetwork,
			pool,
		)
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

export { juster, currentNetwork, switchNetwork, initPools }
