import { defineStore } from "pinia"

export const useApplicationCacheStore = defineStore({
	id: "applicationCache",

	state() {
		return {
			/** Memory cache for Stakes / Liquidity / ... */
			submissions: {
				amount: 0,
			},
		}
	},
})
