<script>
import { defineComponent, onBeforeMount, ref } from "vue"

/**
 * Base
 */
import Header from "./components/base/Header"
import Footer from "@/components/base/Footer"

/** Local */
import TheWelcomeScreen from "@/components/local/onboarding/TheWelcomeScreen"

/**
 * UI
 */
import Notifications from "@/components/local/Notifications"

/**
 * Services
 */
import { juster } from "@/services/sdk"

/**
 * Store
 */
import { useAccountStore } from "@/store/account"

/**
 * Composable
 */
import { useMarket } from "@/composable/market"

export default defineComponent({
	setup() {
		const { setupMarket, setupUser } = useMarket()

		/** Favicon */
		const favicon = document.getElementById("favicon")
		const isDark = window.matchMedia("(prefers-color-scheme: dark)")

		if (isDark.matches) favicon.href = "/favicon_dark.svg"
		else favicon.href = "/favicon_light.svg"

		/**
        /**
         * Setup account & user
         */
		const accountStore = useAccountStore()

		onBeforeMount(() => {
			juster.sdk._provider.client
				.getActiveAccount()
				.then(async (account) => {
					if (!account) return

					accountStore.setPkh(account.address)
					accountStore.updateBalance()

					setupUser()
				})
		})

		/**
		 * Setup Market (Markets & Quotes & Subscriptinos)
		 */
		setupMarket()

		/** Onboarding */
		const showWelcomeScreen = ref(false)
		accountStore.$subscribe((mutation, state) => {
			/** forced display */
			if (state.showOnboarding) {
				showWelcomeScreen.value = true
			}

			if (state.pkh && !localStorage.isOnboardingShown) {
				localStorage.isOnboardingShown = true
				showWelcomeScreen.value = true
			}
		})

		return { showWelcomeScreen }
	},

	components: { Header, Notifications, Footer, TheWelcomeScreen },
})
</script>

<template>
	<div id="modal" />
	<Notifications />

	<transition name="popup">
		<TheWelcomeScreen
			v-if="showWelcomeScreen"
			@skip="showWelcomeScreen = false"
		/>
	</transition>

	<div v-if="!showWelcomeScreen" class="app_wrapper">
		<Header />
		<router-view />
		<Footer class="footer" />
	</div>
</template>

<style>
html {
	font-family: "Inter", sans-serif;
	word-spacing: 1px;
	text-rendering: optimizelegibility;
	-ms-text-size-adjust: 100%;
	-webkit-text-size-adjust: 100%;
	-moz-osx-font-smoothing: grayscale;
	-webkit-font-smoothing: antialiased;
	box-sizing: border-box;

	background: var(--app-bg);
}

.popup-enter-active,
.popup-leave-active {
	transition: all 0.07s ease-out;
}

.popup-enter-from,
.popup-leave-to {
	opacity: 0;
	transform: scale(0.95);
}

.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.35s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}

.fastfade-enter-active,
.fastfade-leave-active {
	transition: opacity 0.15s ease;
}

.fastfade-enter-from,
.fastfade-leave-to {
	opacity: 0;
}

#app {
	display: flex;
	flex-direction: column;

	overflow-x: hidden;

	/* overflow-y: auto; */
	height: 100vh;
}

.app_wrapper {
	display: flex;
	flex-direction: column;

	height: 100%;
	padding-top: 80px;
}

:root {
	/** Application */
	--app-bg: #1b1b1b;

	/** General */
	--blue: #457ee8;
	--red: #e05c43;
	--orange: #ef8456;
	--green: #1aa168;
	--yellow: #f5b72b;
	--purple: #855ad1;

	/** Button */
	--btn-success-bg: #1aa168;
	--btn-success-bg-hover: #24af75;

	--btn-primary-bg: #276ef1;
	--btn-primary-bg-hover: #1f60da;

	--btn-secondary-bg: #252628;
	--btn-secondary-bg-hover: #2d2f31;

	/** Text */
	--text-primary: rgba(255, 255, 255, 0.9);
	--text-secondary: rgba(255, 255, 255, 0.7);
	--text-tertiary: rgba(255, 255, 255, 0.4);
	--text-white: rgba(255, 255, 255, 0.95);
	--text-black: rgba(0, 0, 0, 0.9);
	--text-blue: #6d9cf3;

	/** Icon */
	--icon: #bbbfc9;
	--icon-high: #fff;

	/** Card */
	--card-bg: #171717;

	/** Notification */
	--notification-bg: #27282b;

	/** Dropdown */
	--dropdown-bg: #252525;

	/** Toggle */
	--toggle-bg: #393939;

	/** Settings */
	--settings-nav-bg: rgba(0, 0, 0, 0.4);

	/** Label */
	--label-bg: #222222;

	/** Opacity */
	--opacity-80: rgba(255, 255, 255, 0.8);
	--opacity-60: rgba(255, 255, 255, 0.6);
	--opacity-40: rgba(255, 255, 255, 0.4);
	--opacity-20: rgba(255, 255, 255, 0.2);
	--opacity-10: rgba(255, 255, 255, 0.1);
	--opacity-05: rgba(255, 255, 255, 0.05);

	/** Other */
	--border: rgb(48, 50, 54);
	--border-highlight: rgb(57, 59, 63);
	--separator: rgba(255, 255, 255, 0.08);

	--dot: rgba(255, 255, 255, 0.06);
}

[theme="light"] {
	/** Application */
	--app-bg: #f6f6f6;

	/** General */
	--blue: #276ef1;
	--red: #e05c43;
	--orange: #ef8456;
	--green: #1aa168;
	--yellow: #f5b72b;

	/** Button */
	--btn-primary-bg: #276ef1;
	--btn-primary-bg-hover: #3e7ef5;

	--btn-secondary-bg: #e5e7ea;
	--btn-secondary-bg-hover: #d3d7db;

	/** Text */
	--text-primary: rgba(0, 0, 0, 0.9);
	--text-secondary: rgba(0, 0, 0, 0.7);
	--text-tertiary: rgba(0, 0, 0, 0.3);
	--text-white: rgba(255, 255, 255, 0.95);
	--text-black: rgba(0, 0, 0, 0.9);

	/** Icon */
	--icon: #39393c;
	--icon-high: #202020;

	/** Card */
	--card-bg: #ffffff;

	/** Notification */
	--notification-bg: rgba(255, 255, 255, 0.9);

	/** Settings */
	--settings-nav-bg: rgba(0, 0, 0, 0.1);

	/** Label */
	--label-bg: #fff;

	/** Opacity */
	--opacity-80: rgba(0, 0, 0, 0.8);
	--opacity-60: rgba(0, 0, 0, 0.6);
	--opacity-40: rgba(0, 0, 0, 0.4);
	--opacity-20: rgba(0, 0, 0, 0.2);
	--opacity-10: rgba(0, 0, 0, 0.1);
	--opacity-05: rgba(255, 255, 255, 0.05);

	/** Other */
	--border: rgba(0, 0, 0, 0.1);
	--border-highlight: rgba(0, 0, 0, 0.15);
	--dot: rgba(0, 0, 0, 0.08);
}

*,
*::before,
*::after {
	box-sizing: border-box;
	margin: 0;
}

* {
	touch-action: pan-x pan-y;
}

*::-webkit-scrollbar {
	width: 3px;
}

*::-webkit-scrollbar-track {
	box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.4);
}

*::-webkit-scrollbar-thumb {
	background-color: rgba(255, 255, 255, 0);
	border-radius: 50px;
}

body:hover *::-webkit-scrollbar-thumb {
	background-color: rgba(255, 255, 255, 0.3);
}

body {
	overscroll-behavior-x: none;
	overscroll-behavior-y: none;
	user-select: none;
	-webkit-tap-highlight-color: transparent;
}

button {
	font: inherit;
	padding: 0;
	border: none;
	outline: none;
}

input {
	font: inherit;
	border: none;
	outline: none;
	background: transparent;
}

a {
	color: inherit;
	text-decoration: none;
}

a,
button {
	touch-action: manipulation;
}

h1 {
	font-size: 24px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-primary);
}

h2 {
	font-size: 20px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-primary);
}

h3 {
	font-size: 17px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-primary);
}
</style>
