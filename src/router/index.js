/**
 * Vendor
 */
import { createRouter, createWebHistory } from "vue-router"

/**
 * Store
 */
import { useAppStore } from "@store/app"

const routes = [
	{
		path: "/explore",
		redirect: "/",
	},
	{
		path: "/error",
		name: "error",
		component: () => import("@views/ErrorPage.vue"),
	},
	{
		path: "/:pathMatch(.*)*",
		redirect: "/error",
	},

	{
		path: "/connect",
		name: "Connect",
		component: () => import("@views/ConnectPage.vue"),
	},
	// {
	// 	path: "/landing",
	// 	name: "Landing",
	// 	component: () => import("@views/LandingPage.vue"),
	// },
	// TODO: #3
	// {
	// 	path: "/launch",
	// 	name: "Launch",
	// 	component: () => import("@views/LaunchPage.vue"),
	// },
	{
		path: "/",
		name: "Explore",
		component: () => import("@views/ExplorePage.vue"),
	},

	{
		path: "/events",
		name: "Events",
		component: () => import("@views/EventsPage.vue"),
	},
	{
		path: "/events/top",
		name: "TopEvents",
		component: () => import("@views/TopEventsPage.vue"),
	},
	{
		path: "/events/:id",
		name: "Event",
		component: () => import("@views/EventPage.vue"),
	},

	{
		path: "/markets",
		name: "Markets",
		component: () => import("@views/MarketsPage.vue"),
	},
	{
		path: "/markets/:name",
		name: "Market",
		component: () => import("@views/MarketPage.vue"),
	},
	// TODO: #3
	// Pools
	// {
	// 	path: "/pools",
	// 	name: "Liquidity Pools",
	// 	component: () => import("@views/PoolsPage.vue"),
	// },
	// {
	// 	path: "/pools/:address",
	// 	name: "Liquidity Pool",
	// 	component: () => import("@views/PoolPage.vue"),
	// },
	// {
	// 	path: "/pools/list",
	// 	name: "Raw Pools",
	// 	component: () => import("@views/RawPoolsPage.vue"),
	// },
	// {
	// 	path: "/pools/positions",
	// 	name: "Raw Positions",
	// 	component: () => import("@views/RawPositionsPage.vue"),
	// },

	// TODO: #3
	// Settings
	// {
	// 	path: "/settings",
	// 	name: "Settings",
	// 	component: () => import("@views/SettingsPage.vue"),
	// 	beforeEnter: (to, from, next) => {
	// 		next({ name: "Explore" })
	// 	},
	// 	redirect: "/settings/account/",
	// 	children: [
	// 		// General Settings
	// 		{
	// 			name: "AccountSettings",
	// 			path: "account",
	// 			component: () => import("@/components/modules/settings/pages/AccountSettings.vue"),
	// 		},
	// 		{
	// 			name: "ApplicationSettings",
	// 			path: "application",
	// 			component: () => import("@/components/modules/settings/pages/ApplicationSettings.vue"),
	// 		},
	// 		{
	// 			name: "WalletSettings",
	// 			path: "wallet",
	// 			component: () => import("@/components/modules/settings/pages/WalletSettings.vue"),
	// 		},
	// 		// Appearance Settings
	// 		{
	// 			name: "DisplaySettings",
	// 			path: "display",
	// 			component: () => import("@/components/modules/settings/pages/DisplaySettings.vue"),
	// 		},
	// 		{
	// 			name: "AmountsSettings",
	// 			path: "amounts",
	// 			component: () => import("@/components/modules/settings/pages/AmountsSettings.vue"),
	// 		},
	// 		{
	// 			name: "ThemeSettings",
	// 			path: "theme",
	// 			component: () => import("@/components/modules/settings/pages/ThemeSettings.vue"),
	// 		},
	// 		// Accessibility Settings
	// 		{
	// 			name: "SearchSettings",
	// 			path: "search",
	// 			component: () => import("@/components/modules/settings/pages/SearchSettings.vue"),
	// 		},
	// 		{
	// 			name: "EffectsSettings",
	// 			path: "effects",
	// 			component: () => import("@/components/modules/settings/pages/EffectsSettings.vue"),
	// 		},
	// 		{
	// 			name: "ShortcutsSettings",
	// 			path: "shortcuts",
	// 			component: () => import("@/components/modules/settings/pages/ShortcutsSettings.vue"),
	// 		},
	// 		// Other Settings
	// 		{
	// 			name: "AdvancedSettings",
	// 			path: "advanced",
	// 			component: () => import("@/components/modules/settings/pages/AdvancedSettings.vue"),
	// 		},
	// 		{
	// 			name: "DebuggingSettings",
	// 			path: "debugging",
	// 			component: () => import("@/components/modules/settings/pages/DebuggingSettings.vue"),
	// 		},
	// 		{
	// 			name: "ResetsSettings",
	// 			path: "resets",
	// 			component: () => import("@/components/modules/settings/pages/ResetsSettings.vue"),
	// 		},
	// 	],
	// },
	// TODO: #3
	// {
	// 	path: "/rating",
	// 	name: "Rating",
	// 	component: () => import("@views/LeaderboardPage.vue"),
	// },

	{
		path: "/welcome",
		name: "Welcome",
		component: () => import("@views/WelcomePage.vue"),
	},
	{
		path: "/profile",
		name: "MyProfile",
		component: () => import("@views/ProfilePage.vue"),
		children: [
			{
				path: ":address",
				name: "Profile",
				component: () => import("@views/ProfilePage.vue"),
			},
		],
	},
	{
		path: "/withdrawals",
		name: "Withdrawals",
		component: () => import("@views/WithdrawalsPage.vue"),
	},
	// TODO: #3
	// {
	// 	path: "/blog",
	// 	name: "Blog",
	// 	component: () => import("@views/Other/BlogPage.vue"),
	// },
	// {
	// 	path: "/blog/:slug",
	// 	name: "Article",
	// 	component: () => import("@views/Other/ArticlePage.vue"),
	// },

	{
		path: "/terms",
		name: "Terms",
		component: () => import("@views/Other/TermsPage.vue"),
	},
	{
		path: "/policy",
		name: "Policy",
		component: () => import("@views/Other/PolicyPage.vue"),
	},
	{
		path: "/sitemap",
		name: "Sitemap",
		component: () => import("@views/Other/SitemapPage.vue"),
	},

	{
		path: "/docs",
		name: "Docs",
		component: () => import("@views/DocsPage.vue"),
		redirect: "/docs/discover",
		children: [
			{
				path: ":slug",
				name: "Doc",
				component: () => import("@modules/docs/DocBase.vue"),
			},
		],
	},

	// TODO: #3
	// {
	// 	path: "/releases",
	// 	name: "Releases",
	// 	component: () => import("@views/ReleasesPage.vue"),
	// },
]

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes,
	scrollBehavior() {
		return { top: 0 }
	},
})

router.beforeEach((target, prev, next) => {
	const appStore = useAppStore()

	if (prev.name) appStore.prevRoute = prev

	next()
})

export default router
