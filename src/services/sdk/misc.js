import { juster } from "./juster"

const fetchBalance = async address => {
    const balance = await juster.sdk._tezos.tz.getBalance(address)
    return (balance.toNumber() / 1000000).toFixed(2)
}

export { fetchBalance }
