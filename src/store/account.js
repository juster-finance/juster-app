import { defineStore } from "pinia"

/**
 * Services
 */
import { juster, analytics } from "@sdk"
import { fetchBalance } from "@sdk"
import { demoMode } from "@config"

export const useAccountStore = defineStore({
	id: "account",

	state() {
		return {
			pkh: "",
			balance: 0,
			isBalanceLoaded: false,

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
			this.setPkh("")
			analytics.log("logout", { address: this.pkh })
			this.positionsForWithdrawal = []
		},

		setPkh(pkh) {
			this.pkh = pkh
		},

		async updateBalance() {
			this.balance = await fetchBalance(this.pkh)
			this.isBalanceLoaded = true
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

		isTopUpAllowed() {
			return this.isBalanceLoaded && this.pkh && this.balance <= demoMode.minBalanceToTopUp
		}
	},
})
