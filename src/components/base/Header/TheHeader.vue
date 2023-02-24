<script setup>
/** Vendor */
import { ref, reactive, computed, watch } from "vue"
import { useRoute, useRouter } from "vue-router"

/**
 * Services
 */
import { juster, switchNetwork, currentNetwork } from "@sdk"

/**
 * Constants
 */
import { Networks } from "@/services/constants"

/**
 * Components: UI
 */
import Tooltip from "@ui/Tooltip.vue"
import Button from "@ui/Button.vue"

/**
 * Components: Modules
 */
import ProfileMenu from "@modules/profile/ProfileMenu.vue"

/**
 * Local
 */
import ThePendingTransaction from "./ThePendingTransaction.vue"
import NavigationPopup from "./NavigationPopup.vue"
import RewardAlert from "@local/RewardAlert.vue"

/**
 * Store
 */
import { useAppStore } from "@store/app"
import { useAccountStore } from "@store/account"

const appStore = useAppStore()
const accountStore = useAccountStore()

const route = useRoute()
const router = useRouter()

const activeLink = ref("")
const links = reactive([
	{
		name: "Browse",
		url: "/",
		icon: "compass",
	},
	{
		name: "Resources",
		url: "/docs",
		icon: "package",
	},
	{
		name: "Community",
		url: "/blog",
		icon: "users",
	},
])

const showMobileMenu = ref(false)

/** hardcoded active links */
const isActive = (linkName) => {
	if (linkName === "Browse") {
		if (["Explore", "Events", "Markets", "Ranking", "Market", "Event", "Liquidity Pools", "Liquidity Pool"].includes(route.name))
			return true
	}

	if (linkName === "Resources") {
		if (["Docs", "DocDiscover", "DocBetting", "DocLiquidity", "DocWithdraw", "DocRoadmap"].includes(route.name)) return true
	}

	if (linkName === "Community") {
		if (["Blog", "Releases"].includes(route.name)) return true
	}
}

const pkh = computed(() => accountStore.pkh)

const handleNetworkDblClick = () => {
	juster.sdk._provider.client.clearActiveAccount().then(async () => {
		switchNetwork("mainnet", router)
	})
}
</script>

<template>
	<header :class="[$style.wrapper, currentNetwork !== Networks.MAINNET && $style.testnet]">
		<div v-if="currentNetwork !== Networks.MAINNET" :class="$style.testnetwork_warning">
			<Tooltip placement="bottom">
				<div @dblclick="handleNetworkDblClick" :class="$style.testnetwork_warning__label">Test network</div>

				<template #content>Ghostnet in use. <span>Double-click to switch to Mainnet.</span></template>
			</Tooltip>
		</div>

		<!-- Mobile menu -->
		<transition name="fade">
			<div v-if="showMobileMenu" @click="showMobileMenu = false" :class="$style.mobile_menu">
				<Flex direction="column" gap="16">
					<Flex direction="column" gap="16">
						<div :class="$style.mobile_menu__title">Browse</div>

						<div :class="$style.mobile_menu__links">
							<router-link to="/" :class="$style.mobile_menu__link">
								<div :class="$style.left">
									<Icon name="compass" size="14" />
									<span>Explore</span>
								</div>

								<div :class="$style.mobile_menu__description">Events, Ranking, Stats, etc</div>
							</router-link>
							<router-link to="/events" :class="$style.mobile_menu__link">
								<div :class="$style.left">
									<Icon name="price_event" size="14" />
									<span>Events</span>
								</div>

								<div :class="$style.mobile_menu__description">All events with advanced filters</div>
							</router-link>
							<router-link to="/pools" :class="$style.mobile_menu__link">
								<div :class="$style.left">
									<Icon name="server" size="14" />
									<span>Pools</span>
								</div>

								<div :class="$style.mobile_menu__description">Provide liquidity to events</div>
							</router-link>
							<router-link to="/markets" :class="$style.mobile_menu__link">
								<div :class="$style.left">
									<Icon name="collection" size="14" />
									<span>Markets</span>
								</div>

								<div :class="$style.mobile_menu__description">All available symbols</div>
							</router-link>
						</div>
					</Flex>
					<div :class="$style.divider" />
					<Flex direction="column" gap="16">
						<div :class="$style.mobile_menu__title">Resources</div>

						<div :class="$style.mobile_menu__links">
							<router-link to="/docs/discover" :class="$style.mobile_menu__link">
								<div :class="$style.left">
									<Icon name="compass_1" size="14" />
									<span>Documentation</span>
								</div>

								<div :class="$style.mobile_menu__description">Everything you need is here</div>
							</router-link>
							<router-link to="/docs/roadmap" :class="$style.mobile_menu__link">
								<div :class="$style.left">
									<Icon name="map" size="14" />
									<span>Roadmap</span>
								</div>

								<div :class="$style.mobile_menu__description">Explore the product path</div>
							</router-link>
							<a href="https://github.com/juster-finance" target="_blank" :class="$style.mobile_menu__link">
								<div :class="$style.left">
									<Icon name="github" size="14" />
									<span>Source Code</span>
								</div>

								<div :class="$style.mobile_menu__description">Explore our code & contribute</div>
							</a>
						</div>
					</Flex>
					<div :class="$style.divider" />
					<Flex direction="column" gap="16">
						<div :class="$style.mobile_menu__title">Community</div>

						<div :class="$style.mobile_menu__links">
							<router-link to="/blog" :class="$style.mobile_menu__link">
								<div :class="$style.left">
									<Icon name="feather" size="14" />
									<span>Blog</span>
								</div>

								<div :class="$style.mobile_menu__description">Guides & articles from the team</div>
							</router-link>
							<router-link to="/releases" :class="$style.mobile_menu__link">
								<div :class="$style.left">
									<Icon name="asterisk" size="14" />
									<span>Releases</span>
								</div>

								<div :class="$style.mobile_menu__description">Detailed list of all changes</div>
							</router-link>
							<a href="https://discord.gg/FeGDCkHhnB" target="_blank" :class="$style.mobile_menu__link">
								<div :class="$style.left">
									<Icon name="discord" size="14" />
									<span>Discord</span>
								</div>

								<div :class="$style.mobile_menu__description">Communication and discussion</div>
							</a>
							<a href="https://twitter.com/Juster_fi" target="_blank" :class="$style.mobile_menu__link">
								<div :class="$style.left">
									<Icon name="twitter" size="14" />
									<span>Twitter</span>
								</div>

								<div :class="$style.mobile_menu__description">Latest news and updates</div>
							</a>
						</div>
					</Flex>
				</Flex>
			</div>
		</transition>

		<div :class="$style.base">
			<div :class="$style.left">
				<div @click="showMobileMenu = !showMobileMenu" :class="$style.mobile_menu_icon">
					<Icon :name="showMobileMenu ? 'close' : 'menu'" size="16" />
				</div>

				<router-link to="/" :class="$style.logo" tabindex="-1">
					<Icon name="logo_symbol" size="28" />
				</router-link>
			</div>

			<div @mouseleave="activeLink = ''" :class="$style.links">
				<router-link
					v-for="link in links"
					:key="link.name"
					:to="link.url"
					:id="link.name"
					@mouseenter="activeLink = link.name"
					@focus="activeLink = link.name"
					:class="[$style.link, isActive(link.name) && $style.active]"
				>
					<Icon :name="link.icon" size="16" fill />{{ link.name }}
				</router-link>

				<!-- Popups -->
				<NavigationPopup :active-link="activeLink" @onClick="activeLink = ''" />
			</div>

			<div :class="$style.right">
				<RewardAlert :class="$style.reward_alert" />

				<Flex gap="8">
					<router-link v-if="!pkh && route.path !== '/connect'" to="/connect">
						<Button type="primary" size="small">
							<Icon name="login" size="16" />
							Connect Wallet
						</Button>
					</router-link>
					<router-link v-else-if="!pkh && route.path === '/connect' && appStore.prevRoute" :to="appStore.prevRoute.path">
						<Button type="secondary" size="small">
							<Icon name="back" size="16" />
							Back to {{ appStore.prevRoute.name }}
						</Button>
					</router-link>

					<ProfileMenu v-if="pkh">
						<div :class="$style.avatar">
							<img :src="`https://services.tzkt.io/v1/avatars/${pkh}`" alt="avatar" />
						</div>
					</ProfileMenu>
				</Flex>
			</div>
		</div>
	</header>

	<ThePendingTransaction v-if="accountStore.pendingTransaction.awaiting" />
</template>

<style module>
.wrapper {
	position: fixed;
	top: 0;
	width: 100%;
	min-height: 80px;

	display: flex;
	align-items: center;
	justify-content: center;

	border-bottom: 2px solid var(--border);
	z-index: 2;
}

.wrapper.testnet {
	border-bottom: 2px solid var(--yellow);
}

.testnetwork_warning {
	position: absolute;
	bottom: -20px;
	left: 50%;
	transform: translateX(-50%);

	display: flex;
	align-items: center;

	background: var(--yellow);
	border-radius: 0 0 6px 6px;
	height: 20px;

	padding: 0 8px;
}

.testnetwork_warning__label {
	font-size: 11px;
	line-height: 1;
	font-weight: 700;
	color: var(--text-black);
	text-transform: uppercase;
}

@supports (backdrop-filter: blur(5px)) {
	.wrapper {
		backdrop-filter: blur(10px);
	}
}

@supports not (backdrop-filter: blur(5px)) {
	.wrapper {
		background: var(--app-bg);
	}
}

.base {
	display: flex;
	align-items: center;
	justify-content: space-between;

	max-width: 1250px;
	width: 100%;

	margin: 0 32px;
}

.right {
	display: flex;
	align-items: center;
}

.base .left {
	display: flex;
	align-items: center;
}

.logo {
	display: flex;
	gap: 12px;
}

.logo:focus {
	box-shadow: none;
}

.logo svg {
	fill: var(--text-primary);

	transition: fill 0.4s ease;
}

.logo:hover svg {
	fill: var(--brand);
}

.links {
	position: absolute;
	left: 50%;
	transform: translateX(-50%);

	display: flex;
	align-items: center;

	perspective: 2000px;
}

.link {
	display: flex;
	align-items: center;
	gap: 8px;

	font-size: 14px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-secondary);
	fill: var(--text-tertiary);

	padding: 20px;
	border-radius: 6px;
	cursor: pointer;

	transition: all 0.2s ease;
}

.link.active {
	color: var(--text-primary);
	fill: var(--text-primary);
}

.link:hover {
	color: var(--text-primary);
	fill: var(--text-primary);
}

.reward_alert {
	margin-right: 8px;
}

.avatar {
	position: relative;
}

.avatar img {
	display: flex;
	width: 24px;
	padding: 4px;
	box-sizing: content-box;

	background: var(--btn-secondary-bg);
	border-radius: 6px;

	transition: all 0.2s ease;
}

.avatar:hover img {
	background: var(--btn-secondary-bg-hover);
}

.avatar:active img {
	transform: translateY(1px);
}

@media (max-width: 700px) {
	.base {
		margin: 0 16px;
	}

	.logo img {
		display: none;
	}

	.links {
		display: none;
	}
}

/* Mobile navigation */
.mobile_menu {
	display: none;

	position: absolute;
	top: 80px;
	left: 0;
	right: 0;

	padding: 20px 24px 20px 24px;
	border-bottom: 1px solid var(--border);
	background: var(--app-bg);

	z-index: 100;
}

.mobile_menu__title {
	font-size: 13px;
	line-height: 1.1;
	font-weight: 600;
	color: var(--text-secondary);
}

.mobile_menu__links {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.mobile_menu__link {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.mobile_menu__link .left {
	display: flex;
	align-items: center;
	gap: 10px;
}

.mobile_menu__link .left svg {
	padding: 5px;
	border-radius: 5px;
	background: rgba(255, 255, 255, 0.06);
	fill: var(--text-secondary);
	box-sizing: content-box;
}

.mobile_menu__link .left span {
	font-size: 13px;
	line-height: 1.1;
	font-weight: 600;
	color: var(--text-primary);
}

.mobile_menu__description {
	font-size: 13px;
	line-height: 1.1;
	font-weight: 500;
	color: var(--text-tertiary);
}

.mobile_menu_icon {
	display: none;
	align-items: center;
	justify-content: center;

	width: 32px;
	height: 32px;
	border-radius: 8px;
	background: var(--btn-secondary-bg);

	transition: all 0.2s ease;

	margin-right: 16px;
}

.mobile_menu_icon svg {
	fill: var(--text-primary);
}

.mobile_menu_icon:hover {
	background: var(--btn-secondary-bg-hover);
}

.mobile_menu_icon:active {
	transform: translateY(1px);
}

@media (max-width: 700px) {
	.mobile_menu {
		display: initial;
	}

	.mobile_menu_icon {
		display: flex;
	}
}
</style>
