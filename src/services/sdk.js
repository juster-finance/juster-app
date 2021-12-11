import { juster } from "@/services/tools"
import { OpKind } from "@taquito/taquito"

export const withdrawAll = async ({ eventIds, address }) => {
    try {
        const contract = await juster._tezos.contract.at(
            "KT1JPehwEkAhg1z5RVA8wAccYbDgF2E2itDv",
        )

        if (!eventIds.length || !address) return

        const transactions = []
        eventIds.forEach(id => {
            transactions.push({
                kind: OpKind.TRANSACTION,
                ...contract.methods.withdraw(id, address).toTransferParams(),
            })
        })

        const batch = await juster._tezos.wallet.batch(transactions)

        const batchOp = await batch.send()

        return { success: true, hash: batchOp.hash }
    } catch (error) {
        return { success: false, title: error.title, message: error.message }
    }
}
