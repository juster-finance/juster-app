import { defineStore } from "pinia"

/**
 * Services
 */
import { juster, analytics } from "@sdk"
import { fetchBalance } from "@sdk"

export const useAccountStore = defineStore({
	id: "account",

	state() {
		return {
			pkh: "",
			balance: 0,

			pendingTransaction: {
				awaiting: false,
				when: null,
			},

			isPositionsLoading: false,
			positionsForWithdrawal: [],

			withdrawals: [],

			showOnboarding: false,
		}
	},
	actions: {
		logout() {
			// TODO: #1
			// juster.sdk._provider.client.clearActiveAccount().then(async () => {
			// 	await juster.sdk._provider.client.getActiveAccount()

			// 	analytics.log("logout", { address: this.pkh })

			// 	this.setPkh("")

			// 	this.positionsForWithdrawal = []
			// })
		},

		setPkh(pkh) {
			this.pkh = pkh
		},

		async updateBalance() {
			this.balance = await fetchBalance(this.pkh)
		},

		/** positions */
		removePosition(id) {
			const positionIndex = this.positionsForWithdrawal.findIndex(
				(pos) => pos.id == id,
			)
			if (positionIndex == -1) return

			this.positionsForWithdrawal.splice(positionIndex, 1)
		},
	},
	getters: {
		isLoggined() {
			return !!this.pkh
		},

		wonPositions() {
			return this.positionsForWithdrawal.filter(
				(position) => position.value,
			)
		},
	},
})
