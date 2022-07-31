import { defineStore } from "pinia"

export const useAppStore = defineStore({
	id: "app",

	state() {
		return {
			version: "",

			confirmation: {
				title: "",
				description: "",
				callback: null,
				show: false,
			},
		}
	},

	actions: {
		showConfirmation({ title, description, callback }) {
			this.confirmation.title = title
			this.confirmation.description = description
			this.confirmation.show = true

			this.confirmation.callback = callback
		},
		cancelConfirmation() {
			this.confirmation.show = false
		},
	},
})
