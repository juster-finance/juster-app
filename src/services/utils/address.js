import { toUserFriendlyAddress as toUserFriendlyAddressCore } from '@tonconnect/ui'
import { currentNetwork } from "@sdk"
import { Networks } from "../constants/networks"

export const toUserFriendlyAddress = (rawAddress) => {
    return toUserFriendlyAddressCore(rawAddress, currentNetwork === Networks.TESTNET)
}
