import { createRouter, createWebHistory } from "vue-router"
import { useAccountStore } from "@/store/account"

const routes = [
	{
		path: "/explore",
		redirect: "/",
	},
	{
		path: "/error",
		name: "error",
		component: () =>
			import(/* webpackChunkName: "error" */ "@/views/ErrorPage"),
	},
	{
		path: "/:pathMatch(.*)*",
		redirect: "/error",
	},

	{
		path: "/connect",
		name: "Connect",
		component: () =>
			import(/* webpackChunkName: "connect" */ "@/views/ConnectPage"),
	},
	{
		path: "/landing",
		name: "Landing",
		component: () =>
			import(/* webpackChunkName: "landing" */ "@/views/LandingPage"),
	},
	{
		path: "/launch",
		name: "Launch",
		component: () =>
			import(/* webpackChunkName: "launch" */ "@/views/LaunchPage"),
	},

	{
		path: "/",
		name: "Explore",
		component: () =>
			import(/* webpackChunkName: "explore" */ "@/views/ExplorePage"),
	},

	{
		path: "/events",
		name: "Events",
		component: () =>
			import(/* webpackChunkName: "events" */ "@/views/EventsPage"),
	},
	{
		path: "/events/top",
		name: "TopEvents",
		component: () =>
			import(/* webpackChunkName: "topevents" */ "@/views/TopEventsPage"),
	},
	{
		path: "/events/:id",
		name: "Event",
		component: () =>
			import(/* webpackChunkName: "event" */ "@/views/EventPage"),
	},

	{
		path: "/markets",
		name: "Markets",
		component: () =>
			import(/* webpackChunkName: "markets" */ "@/views/MarketsPage"),
	},
	{
		path: "/markets/:name",
		name: "Market",
		component: () =>
			import(/* webpackChunkName: "market" */ "@/views/MarketPage"),
	},

	{
		path: "/rating",
		name: "Rating",
		component: () =>
			import(/* webpackChunkName: "rating" */ "@/views/LeaderboardPage"),
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
		component: () =>
			import(/* webpackChunkName: "myprofile" */ "@/views/ProfilePage"),
		children: [
			{
				path: ":address",
				name: "Profile",
				component: () =>
					import(
						/* webpackChunkName: "profile" */ "@/views/ProfilePage"
					),
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
		component: () =>
			import(
				/* webpackChunkName: "withdrawals" */ "@/views/WithdrawalsPage"
			),
	},

	{
		path: "/blog",
		name: "Blog",
		component: () =>
			import(/* webpackChunkName: "blog" */ "@/views/Other/BlogPage"),
	},
	{
		path: "/terms",
		name: "Terms",
		component: () =>
			import(/* webpackChunkName: "terms" */ "@/views/Other/TermsPage"),
	},
	{
		path: "/policy",
		name: "Policy",
		component: () =>
			import(/* webpackChunkName: "policy" */ "@/views/Other/PolicyPage"),
	},
	{
		path: "/sitemap",
		name: "Sitemap",
		component: () =>
			import(
				/* webpackChunkName: "sitemap" */ "@/views/Other/SitemapPage"
			),
	},

	{
		path: "/docs",
		name: "Docs",
		component: () =>
			import(/* webpackChunkName: "docs" */ "@/views/DocsPage"),
		redirect: "/docs/discover",
		children: [
			{
				path: "discover",
				name: "Discover",
				component: () =>
					import(
						/* webpackChunkName: "discoverpage" */ "@/components/modules/docs/DiscoverBase"
					),
			},
			{
				path: "betting",
				name: "Betting",
				component: () =>
					import(
						/* webpackChunkName: "bettingpage" */ "@/components/modules/docs/BettingBase"
					),
			},
			{
				path: "liquidity",
				name: "Liquidity",
				component: () =>
					import(
						/* webpackChunkName: "liquiditypage" */ "@/components/modules/docs/LiquidityBase"
					),
			},
			{
				path: "withdraw",
				name: "Withdraw",
				component: () =>
					import(
						/* webpackChunkName: "withdrawpage" */ "@/components/modules/docs/WithdrawBase"
					),
			},
			{
				path: "roadmap",
				name: "Roadmap",
				component: () =>
					import(
						/* webpackChunkName: "roadmappage" */ "@/components/modules/docs/RoadmapBase"
					),
			},
			// {
			// 	path: ":slug",
			// 	name: "Doc",
			// 	component: () =>
			// 		import(/* webpackChunkName: "doc" */ "@/views/DocPage"),
			// },
		],
	},

	/** Releases */
	{
		path: "/releases",
		name: "Releases",
		component: () =>
			import(/* webpackChunkName: "releases" */ "@/views/ReleasesPage"),
	},
	{
		path: "/releases/:slug",
		name: "Release",
		component: () =>
			import(/* webpackChunkName: "release" */ "@/views/ReleasePage"),
	},
]

const router = createRouter({
	history: createWebHistory(process.env.BASE_URL),
	routes,
})

export default router
