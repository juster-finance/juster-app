import { defineStore } from "pinia"

export const useApplicationCacheStore = defineStore({
	id: "applicationCache",

	state() {
		return {
			submissions: {
				amount: 5,
				event: null,
				payout: null,
				side: null,

				isTransactionConfirmed: false,
			},
		}
	},
})
