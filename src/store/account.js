import { defineStore } from "pinia"

/**
 * Services
 */
import { fetchBalance } from "@/services/tools"

export const useAccountStore = defineStore({
    id: "account",

    state() {
        return {
            pkh: "",
            balance: 0,

            wonPositions: [],

            showOnboarding: false,
        }
    },
    actions: {
        setPkh(pkh) {
            this.pkh = pkh
        },

        async updateBalance() {
            this.balance = await fetchBalance(this.pkh)
        },
    },
    getters: {
        isLoggined() {
            return !!this.pkh
        },
    },
})
