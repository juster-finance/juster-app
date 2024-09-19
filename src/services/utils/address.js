import { Address } from '@ton/core'
import { currentNetwork } from "@sdk"
import { Networks } from "../constants/networks"

export const toUserFriendlyAddress = (address) => {
    return Address.parse(address).toString({urlSafe: true, bounceable: false, testOnly: currentNetwork === Networks.TESTNET})
}

export const toRawAddress = (address) => {
    return Address.parse(address).toRawString()
}

export const checkIfValidAddress = (address) => {
    try {
        Address.parse(address)
        return true
    } catch (error) {
        return false
    }
}

export const isRawAddress = (address) => {
    return Address.isRaw(address);
}
