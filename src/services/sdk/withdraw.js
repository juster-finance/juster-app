import { OpKind } from "@taquito/taquito"

/**
 * Services
 */
import { juster } from "@/services/sdk"
import { contracts } from "@/services/config"

export const withdrawAll = async ({ eventIds, address }) => {
    try {
        const contract = await juster.sdk._tezos.contract.at(
            contracts[juster.sdk._network],
        )

        if (!eventIds.length || !address) return

        const transactions = []
        eventIds.forEach(id => {
            transactions.push({
                kind: OpKind.TRANSACTION,
                ...contract.methods.withdraw(id, address).toTransferParams(),
            })
        })

        const batch = await juster.sdk._tezos.wallet.batch(transactions)

        const batchOp = await batch.send()

        return { success: true, hash: batchOp.hash }
    } catch (error) {
        return { success: false, title: error.title, message: error.message }
    }
}
