// import { Juster } from "@juster-finance/sdk"
import { Juster } from "@juster-finance/sdk"
import { createClient } from "@juster-finance/gql-client"
import { TezosToolkit } from "@taquito/taquito"

/** Config */
import { dipdup } from "@/services/config"

const juster = Juster.create("testnet")

const gql = createClient({
    url: dipdup.uri.graphq,
    subscription: { url: dipdup.uri.subscription },
})

const tezos = new TezosToolkit("https://granadanet.smartpy.io")

/**
 * Utils
 */
export const fetchBalance = async address => {
    const balance = await tezos.tz.getBalance(address)
    return (balance.toNumber() / 1000000).toFixed(2)
}

export { juster, gql, tezos }
