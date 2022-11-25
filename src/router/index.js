import { createRouter, createWebHistory } from "vue-router"
import { useAccountStore } from "@store/account"

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
	{
		path: "/landing",
		name: "Landing",
		component: () => import("@views/LandingPage.vue"),
	},
	{
		path: "/launch",
		name: "Launch",
		component: () => import("@views/LaunchPage.vue"),
	},

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

	{
		path: "/pools",
		name: "Liquidity Pools",
		component: () => import("@views/PoolsPage.vue"),
	},

	{
		path: "/rating",
		name: "Rating",
		component: () => import("@views/LeaderboardPage.vue"),
	},
	{
		path: "/profile",
		name: "MyProfile",
		beforeEnter: (to, from, next) => {
			const accountStore = useAccountStore()

			if (to.params.address) {
				next()
				return
			}

			if (accountStore.isLoggined) {
				next()
			} else {
				next({ name: "Explore" })
			}
		},
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
		beforeEnter: (to, from, next) => {
			const accountStore = useAccountStore()
			if (accountStore.isLoggined) {
				next()
			} else {
				next({ name: "Explore" })
			}
		},
		component: () => import("@views/WithdrawalsPage.vue"),
	},

	{
		path: "/blog",
		name: "Blog",
		component: () => import("@views/Other/BlogPage.vue"),
	},
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
				path: "discover",
				name: "Discover",
				component: () => import("@modules/docs/DiscoverBase.vue"),
			},
			{
				path: "betting",
				name: "Betting",
				component: () => import("@modules/docs/BettingBase.vue"),
			},
			{
				path: "liquidity",
				name: "Liquidity",
				component: () => import("@modules/docs/LiquidityBase.vue"),
			},
			{
				path: "withdraw",
				name: "Withdraw",
				component: () => import("@modules/docs/WithdrawBase.vue"),
			},
			{
				path: "roadmap",
				name: "Roadmap",
				component: () => import("@modules/docs/RoadmapBase.vue"),
			},
			// {
			// 	path: ":slug",
			// 	name: "Doc",
			// 	component: () =>
			// 		import( "@views/DocPage"),
			// },
		],
	},

	/** Releases */
	{
		path: "/releases",
		name: "Releases",
		component: () => import("@views/ReleasesPage.vue"),
	},
	{
		path: "/releases/:slug",
		name: "Release",
		component: () => import("@views/ReleasePage.vue"),
	},
]

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes,
})

export default router
