import { defineStore } from "pinia"

export const useDocsStore = defineStore({
	id: "docs",

	state() {
		return {
			sections: {},
			post: {},
		}
	},
})
