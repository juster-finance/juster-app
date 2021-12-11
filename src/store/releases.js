import { defineStore } from "pinia"

export const useReleasesStore = defineStore({
    id: "releases",

    state() {
        return {
            all: [],
        }
    },
})
