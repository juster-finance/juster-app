import { defineStore } from "pinia"

/**
 * Services
 */
import { tezos } from "@/services/tools"

export const useAccountStore = defineStore({
    id: "account",

    state() {
        return {
            pkh: "",
            balance: 0,

            hasWonPositions: false,
        }
    },
    actions: {
        setPkh(pkh) {
            this.pkh = pkh
        },

        updateBalance() {
            tezos.tz
                .getBalance(this.pkh)
                .then(val => (this.balance = val.toNumber() / 1000000))
        },
    },
    getters: {
        isLoggined() {
            return !!this.pkh
        },
    },
})
