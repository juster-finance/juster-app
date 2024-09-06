/**
 * Services
 */
import { juster } from "@sdk"
import { contracts } from "@config"

export const withdrawAll = async ({ eventIds, address }) => {
	try {
		// TODO: #1
		// const contract = await juster.sdk._tezos.contract.at(
		// 	contracts[
		// 		juster.sdk._network === "mainnet" ? "mainnet" : "testnet"
		// 	],
		// )

		// if (!eventIds.length || !address) return

		// const transactions = []
		// eventIds.forEach((id) => {
		// 	transactions.push({
		// 		kind: "transaction",
		// 		...contract.methods.withdraw(id, address).toTransferParams(),
		// 	})
		// })

		// const batch = await juster.sdk._tezos.wallet.batch(transactions)

		// const batchOp = await batch.send()

		// return { success: true, hash: batchOp.hash }
	} catch (error) {
		return { success: false, title: error.title, message: error.message }
	}
}
