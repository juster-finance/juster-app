import { v4 as uuidv4 } from "uuid"

import { defineStore } from "pinia"

export const useNotificationsStore = defineStore({
    id: "notifications",

    state() {
        return {
            notifications: [],
        }
    },
    actions: {
        create({ notification }) {
            const id = uuidv4()

            if (this.notifications.length > 3) {
                this.notifications.pop()
            }

            if (notification.autoDestroy) {
                setTimeout(() => {
                    this.remove({ id })
                }, 6000)
            }

            this.notifications.push({ ...notification, id })
        },
        remove({ id }) {
            this.notifications = this.notifications.filter(
                notification => notification.id !== id,
            )
        },
    },
})
