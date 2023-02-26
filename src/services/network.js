import { useAppStore } from "@/store/app"

const watchNetwork = () => {
	const appStore = useAppStore()

	window.addEventListener("online", (e) => {
		appStore.isOnline = true
	})
	window.addEventListener("offline", (e) => {
		appStore.isOnline = false
		console.log(appStore.isOnline)
	})
}

export { watchNetwork }
