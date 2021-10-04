import { createRouter, createWebHistory } from "vue-router"
import { useAccountStore } from "@/store/account"

const routes = [
    {
        path: "/",
        redirect: "/explore",
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
        path: "/landing",
        name: "Landing",
        component: () =>
            import(/* webpackChunkName: "landing" */ "@/views/LandingPage"),
    },

    {
        path: "/explore",
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
        path: "/events/:id",
        name: "Event",
        component: () =>
            import(/* webpackChunkName: "event" */ "@/views/EventPage"),
    },

    {
        path: "/symbols",
        name: "Symbols",
        component: () =>
            import(/* webpackChunkName: "symbols" */ "@/views/SymbolsPage"),
    },
    {
        path: "/symbols/:name",
        name: "Symbol",
        component: () =>
            import(/* webpackChunkName: "symbol" */ "@/views/SymbolPage"),
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
        path: "/docs",
        name: "Docs",
        component: () =>
            import(/* webpackChunkName: "docs" */ "@/views/DocsPage"),
        children: [
            {
                path: ":slug",
                name: "Doc",
                component: () =>
                    import(/* webpackChunkName: "doc" */ "@/views/DocPage"),
            },
        ],
    },
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
})

export default router
