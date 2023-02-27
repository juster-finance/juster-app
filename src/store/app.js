import { defineStore } from "pinia"

export const useAppStore = defineStore({
	id: "app",

	state() {
		return {
			version: "",

			isOnline: true,

			confirmation: {
				title: "",
				description: "",
				metadata: {
					buttons: {
						cancel: {
							title: null,
							icon: null,
						},
						confirm: {
							title: null,
							icon: null,
						},
					},
				},
				badges: [],
				callback: null,
				show: false,
			},

			prevRoute: null,
		}
	},

	actions: {
		showConfirmation({ title, description, callback }) {
			this.confirmation.title = title
			this.confirmation.description = description
			this.confirmation.show = true

			this.confirmation.callback = callback
		},
	},
})
