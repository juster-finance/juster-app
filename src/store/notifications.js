import { v4 as uuidv4 } from "uuid"

import { defineStore } from "pinia"

export const useNotificationsStore = defineStore({
	id: "notifications",

	state() {
		return {
			items: [],
		}
	},
	actions: {
		create({ notification }) {
			const id = uuidv4()

			if (this.items.length > 3) {
				this.items.pop()
			}

			if (notification.autoDestroy) {
				setTimeout(() => {
					this.remove({ id })
				}, 8000)
			}

			this.items.unshift({ ...notification, id })
		},
		remove({ id }) {
			this.items = this.items.filter(
				(notification) => notification.id !== id,
			)
		},
	},
})
