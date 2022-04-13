<script>
import {
    defineComponent,
    onMounted,
    onBeforeUnmount,
    ref,
    onUnmounted,
} from "vue"
import { useRouter } from "vue-router"
import { useMeta } from "vue-meta"
import { cloneDeep } from "lodash"

/**
 * Local
 */
import RatingCard from "./RatingCard"
import RatingCardLoading from "./RatingCardLoading"
import MyPositionCard from "./MyPositionCard"
import MarketCard from "@/components/local/MarketCard"
import { EventCard, EventCardLoading } from "@/components/local/EventCard"

/**
 * UI
 */
import Button from "@/components/ui/Button"

/**
 * API
 */
import { fetchTopEvents } from "@/api/events"
import { fetchTopBettors, fetchTopLiquidityProviders } from "@/api/users"

/**
 * Subscriptions
 */
import { eventSub } from "@/graphql/subscriptions/event"

/**
 * Store
 */
import { useMarketStore } from "@/store/market"
import { useAccountStore } from "@/store/account"

/**
 * Services
 */
import { juster, analytics } from "@/services/sdk"

export default defineComponent({
    name: "ExploreBase",

    setup() {
        const router = useRouter()

        const marketStore = useMarketStore()
        const accountStore = useAccountStore()

        const subToMyPositions = ref({})
        const myPositions = ref([])

        /** Ranking */
        const isTopProvidersLoading = ref(true)
        const isTopBettorsLoading = ref(true)
        const topProviders = ref([])
        const topBettors = ref([])

        const handleViewTopEvents = () => {
            router.push("/events/top")
        }

        onMounted(async () => {
            analytics.log("onPage", { name: "Explore" })

            /**
             * Block: My Positions
             */
            subToMyPositions.value = await juster.gql
                .subscription({
                    position: [
                        {
                            where: {
                                userId: { _eq: accountStore.pkh },
                                event: { status: { _in: ["NEW", "STARTED"] } },
                            },
                        },
                        {
                            id: true,
                            value: true,
                            event: eventSub,
                        },
                    ],
                })
                .subscribe({
                    next: ({ position: positions }) => {
                        myPositions.value = positions
                    },
                    error: console.error,
                })

            /**
             * Block: Top Events & Providers
             */
            const topEvents = await fetchTopEvents({ limit: 3 })
            marketStore.events = cloneDeep(topEvents).sort(
                (a, b) => b.bets.length - a.bets.length,
            )

            const rawTopProviders = await fetchTopLiquidityProviders()
            const rawTopBettors = await fetchTopBettors()

            topProviders.value = rawTopProviders.map((el) => {
                return { address: el.address, value: el.totalProviderReward }
            })
            isTopProvidersLoading.value = false

            topBettors.value = rawTopBettors.map((el) => {
                return { address: el.address, value: el.totalBetsCount }
            })
            isTopBettorsLoading.value = false
        })
        onBeforeUnmount(() => {
            marketStore.events = []
        })

        onUnmounted(() => {
            if (
                subToMyPositions.value.hasOwnProperty("_state") &&
                !subToMyPositions.value?.closed
            ) {
                subToMyPositions.value.unsubscribe()
            }
        })

        /** Meta */
        useMeta({
            title: "Explore",
            description:
                "Juster is an on-chain smart contract platform allowing users to take part in an automated betting market by creating events, providing liquidity to them, and making bets.",
        })

        return {
            marketStore,
            myPositions,
            topProviders,
            topBettors,
            isTopBettorsLoading,
            isTopProvidersLoading,
            handleViewTopEvents,
        }
    },

    components: {
        RatingCard,
        RatingCardLoading,
        MyPositionCard,
        MarketCard,
        EventCard,
        EventCardLoading,
        Button,
    },
})
</script>

<template>
    <transition name="fade">
        <div :class="$style.wrapper">
            <metainfo>
                <template v-slot:title="{ content }"
                    >{{ content }} • Juster</template
                >
            </metainfo>

            <!-- My Positions -->
            <div v-if="myPositions.length" :class="$style.block">
                <h1>My Positions</h1>
                <div :class="$style.description">
                    Events in which you have liquidity or bet
                </div>

                <div :class="$style.my_positions">
                    <MyPositionCard
                        v-for="position in myPositions"
                        :key="position.id"
                        :event="position.event"
                    />
                </div>
            </div>

            <!-- Top markets -->
            <div v-if="marketStore.isMarketsLoaded" :class="$style.block">
                <h1>Top Markets</h1>
                <div :class="$style.description">
                    Currency pairs available for betting
                </div>

                <div :class="$style.items">
                    <MarketCard
                        v-for="market in marketStore.markets"
                        :key="market.id"
                        :market="market"
                    />
                </div>
            </div>

            <!-- Top Liquidity -->
            <div :class="$style.block">
                <h1>Top Liquidity</h1>
                <div :class="$style.description">
                    Rating of users providing liquidity
                </div>

                <RatingCard
                    v-if="!isTopProvidersLoading"
                    :users="topProviders"
                    suffix="ꜩ"
                    :class="$style.rating_card"
                />
                <RatingCardLoading v-else :class="$style.rating_card" />
            </div>

            <!-- Hot events -->
            <div :class="$style.block">
                <div :class="$style.head">
                    <div :class="$style.left">
                        <h1>Hot Events</h1>
                        <div :class="$style.description">
                            Events that have not yet begun, but are attracting
                            the interest of participants
                        </div>
                    </div>

                    <Button
                        @click="handleViewTopEvents"
                        size="small"
                        type="secondary"
                    >
                        <Icon name="collection" size="16" />View all
                    </Button>
                </div>

                <transition name="fastfade" mode="out-in">
                    <div v-if="marketStore.events.length" :class="$style.items">
                        <EventCard
                            v-for="event in marketStore.events"
                            :key="event.id"
                            :event="event"
                        />
                    </div>

                    <div v-else :class="$style.items">
                        <EventCardLoading />
                        <EventCardLoading />
                        <EventCardLoading />
                    </div>
                </transition>
            </div>

            <!-- Top Bettors -->
            <div :class="$style.block">
                <h1>Top Bettors</h1>
                <div :class="$style.description">
                    Rating of users placing bets
                </div>

                <RatingCard
                    v-if="!isTopBettorsLoading"
                    :users="topBettors"
                    suffix="Bets"
                    :class="$style.rating_card"
                />
                <RatingCardLoading v-else :class="$style.rating_card" />
            </div>
        </div>
    </transition>
</template>

<style module>
.wrapper {
}

.block {
    margin-bottom: 60px;
}

.block:last-child {
    margin-bottom: 0;
}

.block h1 {
    letter-spacing: 0.5px;
}

.head {
    display: flex;
    justify-content: space-between;
}

.left {
    margin-right: 40px;
}

.description {
    font-size: 14px;
    font-weight: 500;
    line-height: 22px;
    color: var(--text-tertiary);

    margin-top: 8px;
}

.rating_card {
    margin-top: 24px;
}

.my_positions {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(530px, 1fr));
    grid-gap: 16px;

    margin-top: 24px;
}

.items {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    grid-gap: 16px;

    margin-top: 24px;
}

@media (max-width: 500px) {
    .head {
        flex-direction: column;
        gap: 16px;
    }
}

@media (max-width: 420px) {
    .items {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    }
}
</style>
