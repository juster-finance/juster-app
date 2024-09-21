import { defineStore } from "pinia"

/**
 * Services
 */
import { juster, analytics } from "@sdk"
import { demoMode } from "@config"

export const useAccountStore = defineStore({
	id: "account",

	state() {
		return {
			pkh: "",
			balance: 0,
			lockedAmount: 0,
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
			const user = await juster.sdk.getUser(this.pkh)
			this.balance = user.balance.toFixed(2)
			this.lockedAmount = user.lockedAmount.toFixed(2)
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
			return this.isBalanceLoaded && this.pkh && (this.balance + this.lockedAmount) <= demoMode.minBalanceToTopUp
		}
	},
})
