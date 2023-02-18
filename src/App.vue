<script setup>
/**
 * Vendor
 */
import { onBeforeMount, onMounted } from "vue"

/**
 * Styles
 */
import "@/styles/variables.css"
import "@/styles/padding.css"
import "@/styles/margin.css"
import "@/styles/flex.css"
import "@/styles/text.css"

/**
 * Base
 */
import Teleports from "@base/Teleports.vue"
import TheHeader from "@base/Header/TheHeader.vue"
import Footer from "@base/Footer.vue"

/**
 * UI
 */
import Notifications from "@local/Notifications.vue"
import ConfirmationModal from "@local/modals/ConfirmationModal.vue"

/**
 * Services
 */
import { juster, initPools } from "@sdk"
import { fetchAllPools, fetchPoolsLines } from "@/api/pools"

/**
 * Store
 */
import { useAccountStore } from "@store/account"
import { useAppStore } from "@store/app"
import { useMarketStore } from "@store/market"

/**
 * Composable
 */
import { useMarket } from "@/composable/market"

const { setupMarket, setupUser } = useMarket()

/** Favicon */
const favicon = document.getElementById("favicon")
const isDark = window.matchMedia("(prefers-color-scheme: dark)")

if (isDark.matches) favicon.href = "/favicon_dark.svg"
else favicon.href = "/favicon_light.svg"

const accountStore = useAccountStore()
const appStore = useAppStore()
const marketStore = useMarketStore()

onBeforeMount(() => {
	juster.sdk._provider.client.getActiveAccount().then(async (account) => {
		if (!account) return

		accountStore.setPkh(account.address)
		accountStore.updateBalance()

		setupUser()
	})
})
onMounted(async () => {
	// window.addEventListener("mousedown", (e) => alert(e))

	marketStore.pools = await fetchAllPools()
	initPools(marketStore.pools)

	document.addEventListener("keydown", (e) => {
		if (e.key === "Enter") {
			const { activeElement } = document
			if (activeElement.tagName.toLowerCase() === "a") return
			activeElement.click()
		}
	})

	const lines = await fetchPoolsLines()
	marketStore.lines = lines
})

/**
 * Setup Market (Markets & Quotes & Subscriptinos)
 */
setupMarket()
</script>

<template>
	<Teleports />

	<ConfirmationModal :show="appStore.confirmation.show" />

	<Notifications />

	<div class="app_wrapper">
		<TheHeader />
		<div class="app_base">
			<router-view />
		</div>
		<Footer class="footer" />
	</div>
</template>

<style>
html {
	font-family: "Inter", sans-serif;
	text-rendering: optimizelegibility;
	-ms-text-size-adjust: 100%;
	-webkit-text-size-adjust: 100%;
	-moz-osx-font-smoothing: grayscale;
	-webkit-font-smoothing: antialiased;
	box-sizing: border-box;

	background: var(--app-bg);
}

.dropdown-enter-active,
.dropdown-leave-active {
	transform-origin: 0px 0px;

	transition: all 0.2s var(--bezier);
}

.dropdown-enter-from,
.dropdown-leave-to {
	opacity: 0;
	transform: translateY(20px);
}

.popup-enter-active,
.popup-leave-active {
	transition: all 0.15s var(--bezier);
}

.popup-enter-from,
.popup-leave-to {
	opacity: 0;
	transform: scale(0.95) translateY(5px);
}

.navpopup-enter-active,
.navpopup-leave-active {
	will-change: transform, opacity;
	transform-origin: 50% -50%;
	transition: transform 0.2s ease, opacity 0.2s ease;
}

.navpopup-enter-from,
.navpopup-leave-to {
	opacity: 0;
	transform: rotateX(-15deg);
	transform-origin: 50% -50%;
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

.slide-enter-active {
	transition: all 0.4s ease;
}

.slide-enter-from {
	opacity: 0;
	transform: translateY(-4px);
}

.slowslide-enter-active {
	transition: all 3.5s var(--bezier);
	will-change: transform, opacity;
	transform-origin: 50% -50%;
}

.slowslide-enter-from {
	opacity: 0;
	transform: translateY(-10px) scale(1.2);
	transform-origin: 50% -50%;
}

#app {
	display: flex;
	flex-direction: column;

	overflow-x: hidden;
}

.app_wrapper {
	display: flex;
	flex-direction: column;
}

.app_base {
	flex: 1;

	min-height: 100vh;

	padding-top: 80px;
}

:root {
	/* --app-bg: #1b1b1b; */
	--app-bg: #1a1a1d;
	--modal-bg: #232327;
	--notification-bg: #232327;

	/** General */
	--blue: #457ee8;
	--red: #e05c43;
	--orange: #ef8456;
	--green: #1aa168;
	--yellow: #f5b72b;
	--purple: #855ad1;
	--brand: #ee5b46;

	/** Button */
	--btn-success-bg: #1aa168;
	--btn-success-bg-hover: #24af75;

	--btn-error-bg: #e05c43;
	--btn-error-bg-hover: #ce4f35;

	--btn-white-bg: rgba(255, 255, 255, 0.9);
	--btn-white-bg-hover: rgba(255, 255, 255, 0.8);

	--btn-primary-bg: #276ef1;
	--btn-primary-bg-hover: #1f60da;

	--btn-secondary-bg: #252628;
	--btn-secondary-bg-hover: #2d2f31;

	/** Text */
	--text-primary: rgba(255, 255, 255, 0.9);
	--text-secondary: rgba(255, 255, 255, 0.7);
	--text-tertiary: rgba(255, 255, 255, 0.4);
	--text-support: rgba(255, 255, 255, 0.2);
	--text-white: rgba(255, 255, 255, 0.95);
	--text-black: rgba(0, 0, 0, 0.9);
	--text-blue: #6d9cf3;

	/** Icon */
	--icon: #bbbfc9;
	--icon-high: #fff;

	/** Card */
	--card-bg: #232326;

	/** Dropdown */
	--dropdown-bg: #27272a;

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
	--opacity-03: rgba(255, 255, 255, 0.03);

	/** Other */
	--border: rgba(255, 255, 255, 0.08);
	--border-highlight: rgba(255, 255, 255, 0.14);
	--separator: rgba(255, 255, 255, 0.08);

	--dot: rgba(255, 255, 255, 0.06);

	--bezier: cubic-bezier(0.19, 1, 0.22, 1);
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
	--brand: #ee5b46;

	/** Button */
	--btn-primary-bg: #276ef1;
	--btn-primary-bg-hover: #3e7ef5;

	--btn-secondary-bg: #e5e7ea;
	--btn-secondary-bg-hover: #d3d7db;

	/** Text */
	--text-primary: rgba(0, 0, 0, 0.9);
	--text-secondary: rgba(0, 0, 0, 0.7);
	--text-tertiary: rgba(0, 0, 0, 0.3);
	--text-support: rgba(0, 0, 0, 0.15);
	--text-white: rgba(255, 255, 255, 0.95);
	--text-black: rgba(0, 0, 0, 0.9);

	/** Icon */
	--icon: #39393c;
	--icon-high: #202020;

	/** Card */
	--card-bg: #ffffff;

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

input[type="number"] {
	-moz-appearance: textfield;
}

a {
	color: inherit;
	text-decoration: none;
	outline: none;

	box-shadow: 0 0 0 0 transparent;

	transition: box-shadow 0.2s ease;
}
a:focus-visible {
	outline: none;
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
	font-size: 18px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-primary);
}

h4 {
	font-size: 16px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-primary);
}
</style>
