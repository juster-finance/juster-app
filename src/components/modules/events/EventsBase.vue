<script>
import {
    defineComponent,
    reactive,
    ref,
    onMounted,
    watch,
    computed,
    onBeforeUnmount,
    onUnmounted,
} from "vue"
import { useMeta } from "vue-meta"
import { cloneDeep } from "lodash"
import { gql } from "@/services/tools"

/**
 * API
 */
import { fetchAllEvents } from "@/api/events"

/**
 * UI
 */
import Breadcrumbs from "@/components/ui/Breadcrumbs"
import Banner from "@/components/ui/Banner"

/**
 * Local
 */
import EventCard from "@/components/local/EventCard"
import EventCardLoading from "@/components/local/EventCardLoading"

/**
 * Store
 */
import { useMarketStore } from "@/store/market"

import EventsFilters from "./EventsFilters"

const defaultFilters = {
    symbols: {
        xtz: true,
        btc: false,
        eth: false,
    },

    periods: [
        {
            name: "1h",
            active: false,
        },
        {
            name: "6h",
            active: false,
        },
        {
            name: "24h",
            active: false,
        },
    ],

    statuses: [
        {
            name: "New",
            icon: "bolt",
            color: "green",
            active: true,
        },
        {
            name: "Active",
            icon: "time",
            color: "yellow",
            active: false,
        },
    ],
}

export default defineComponent({
    name: "EventsBase",

    setup() {
        const breadcrumbs = reactive([
            {
                name: "All events",
                path: "/events",
            },
        ])

        const marketStore = useMarketStore()

        const subscription = ref(null)

        const isAllEventsLoaded = ref(false)

        /** Filters */
        let filters = ref(cloneDeep(defaultFilters))

        const liquidityRange = reactive({
            min: 0,
            max: 0,
        })
        const liquidityFilters = reactive({
            min: 0,
            max: 0,
        })

        const handleNewMin = (value) => {
            liquidityFilters.min = value
        }

        const handleNewMax = (value) => {
            liquidityFilters.max = value
        }

        const handleSelectPeriod = (target) => {
            filters.value.periods.forEach((period) => {
                if (target.name == period.name) period.active = !period.active
            })
        }

        const handleSelectStatus = (target) => {
            filters.value.statuses.forEach((status) => {
                if (target.name == status.name) status.active = !status.active
            })
        }

        const handleResetFilters = () => {
            liquidityFilters.min = liquidityRange.min
            liquidityFilters.max = liquidityRange.max

            filters.value = cloneDeep(defaultFilters)
        }

        /** Events */
        const availableEvents = computed(() => {
            return marketStore.events.filter((event) =>
                ["NEW", "STARTED"].includes(event.status),
            )
        })
        const filteredEvents = computed(() => {
            let events = cloneDeep(marketStore.events)

            /** Filter by Symbol */
            if (
                filters.value.symbols.xtz ||
                filters.value.symbols.btc ||
                filters.value.symbols.eth
            ) {
                const symbols = [
                    filters.value.symbols.xtz && "XTZ-USD",
                    filters.value.symbols.btc && "BTC-USD",
                    filters.value.symbols.eth && "ETH-USD",
                ].filter(Boolean)

                events = events.filter((event) =>
                    symbols.includes(event.currencyPair.symbol),
                )
            } else {
                return []
            }

            /** Filter by Liquidity */
            events = events.filter(
                (event) => event.totalLiquidityProvided >= liquidityFilters.min,
            )
            events = events.filter(
                (event) => event.totalLiquidityProvided <= liquidityFilters.max,
            )

            /** Filter by Status */
            if (filters.value.statuses.length) {
                const statuses = filters.value.statuses
                    .filter((status) => status.active)
                    .map((status) => {
                        if (status.name == "New") return "NEW"
                        if (status.name == "Active") return "STARTED"
                        if (status.name == "Finished") return "FINISHED"
                    })

                events = events.filter((event) =>
                    statuses.includes(event.status),
                )
            }

            /** Filter by Period */
            if (filters.value.periods.length) {
                const periods = filters.value.periods
                    .filter((period) => period.active)
                    .map(
                        (period) =>
                            (period.name == "1h" && 3600) ||
                            (period.name == "6h" && 21600) ||
                            (period.name == "24h" && 86400),
                    )

                if (periods.length) {
                    events = events.filter((event) =>
                        periods.includes(event.measurePeriod),
                    )
                }
            }

            return events
        })

        watch(
            () => marketStore.events,
            () => {
                const allLiquidity = cloneDeep(marketStore.events)
                    .filter((event) =>
                        ["NEW", "STARTED"].includes(event.status),
                    )
                    .map((event) => event.totalLiquidityProvided)

                liquidityRange.min = Math.min(...allLiquidity)
                liquidityRange.max = Math.max(...allLiquidity)
                liquidityFilters.min = Math.min(...allLiquidity)
                liquidityFilters.max = Math.max(...allLiquidity)
            },
            { deep: true },
        )

        onMounted(async () => {
            let allNewEvents = await fetchAllEvents()

            isAllEventsLoaded.value = true

            marketStore.events = cloneDeep(allNewEvents)

            // subscribe to new events
            subscription.value = await gql
                .subscription({
                    event: [
                        {
                            where: {
                                status: { _eq: "NEW" },
                            },
                        },
                        {
                            id: true,
                            status: true,
                            betsCloseTime: true,
                            creatorId: true,
                            currencyPair: {
                                symbol: true,
                                id: true,
                            },
                            poolAboveEq: true,
                            poolBelow: true,
                            totalBetsAmount: true,
                            totalLiquidityProvided: true,
                            totalLiquidityShares: true,
                            totalValueLocked: true,
                            liquidityPercent: true,
                            measurePeriod: true,
                            closedOracleTime: true,
                            createdTime: true,
                            startRate: true,
                            closedRate: true,
                            winnerBets: true,
                            targetDynamics: true,
                            bets: {
                                id: true,
                                side: true,
                                reward: true,
                                amount: true,
                                createdTime: true,
                                userId: true,
                            },
                            deposits: {
                                amountAboveEq: true,
                                amountBelow: true,
                                eventId: true,
                                id: true,
                                userId: true,
                                createdTime: true,
                                shares: true,
                            },
                        },
                    ],
                })
                .subscribe({
                    next: (data) => {
                        const { event: newEvents } = data

                        newEvents.forEach((newEvent) => {
                            if (
                                marketStore.events.some(
                                    (event) => newEvent.id == event.id,
                                )
                            ) {
                                return
                            }

                            marketStore.events.push(newEvent)
                        })
                    },
                    error: console.error,
                })
        })

        onBeforeUnmount(() => {
            marketStore.events = []
        })

        onUnmounted(() => {
            if (
                subscription.value &&
                subscription.value.unsubscribe &&
                !subscription.value?.closed
            ) {
                subscription.value.unsubscribe()
            }
        })

        /** Meta */
        const { meta } = useMeta({
            title: `All events`,
            description: "All available events",
        })

        return {
            breadcrumbs,
            marketStore,
            isAllEventsLoaded,
            filteredEvents,
            availableEvents,
            filters,
            liquidityRange,
            liquidityFilters,
            handleNewMin,
            handleNewMax,
            handleSelectPeriod,
            handleSelectStatus,
            handleResetFilters,
        }
    },

    components: {
        Breadcrumbs,
        Banner,
        EventsFilters,
        EventCard,
        EventCardLoading,
    },
})
</script>

<template>
    <div :class="$style.wrapper">
        <metainfo>
            <template v-slot:title="{ content }"
                >{{ content }} • Juster</template
            >
        </metainfo>

        <Breadcrumbs :crumbs="breadcrumbs" :class="$style.breadcrumbs" />

        <h1>All events</h1>
        <div :class="$style.description">
            List of all new, active, and past events with customizable filtering
        </div>

        <div :class="$style.container">
            <EventsFilters
                :filters="filters"
                :liquidityRange="liquidityRange"
                :liquidityFilters="liquidityFilters"
                :events="marketStore.events"
                @onNewMin="handleNewMin"
                @onNewMax="handleNewMax"
                @onSelectPeriod="handleSelectPeriod"
                @onSelectStatus="handleSelectStatus"
                @onReset="handleResetFilters"
                :class="$style.filters_block"
            />

            <div :class="$style.events_base">
                <Banner
                    type="info"
                    v-if="filteredEvents.length == 0 && isAllEventsLoaded"
                    >All
                    {{ availableEvents.length - filteredEvents.length }} events
                    hidden due to filters. Reset filters to see some</Banner
                >
                <Banner
                    type="info"
                    v-else-if="filteredEvents.length !== availableEvents.length"
                    >{{ availableEvents.length - filteredEvents.length }} events
                    hidden due to filters</Banner
                >

                <transition name="fastfade" mode="out-in">
                    <div v-if="filteredEvents.length" :class="$style.events">
                        <EventCard
                            v-for="event in filteredEvents"
                            :key="event.id"
                            :event="event"
                        />
                    </div>

                    <div v-else-if="!isAllEventsLoaded" :class="$style.events">
                        <EventCardLoading />
                        <EventCardLoading />
                        <EventCardLoading />
                    </div>
                </transition>
            </div>
        </div>
    </div>
</template>

<style module>
.wrapper {
}

.wrapper h1 {
    font-family: "CalSans";
}

.breadcrumbs {
    margin-bottom: 24px;
}

.description {
    font-size: 14px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-tertiary);

    margin-top: 8px;
    margin-bottom: 24px;
}

.container {
    display: flex;
    gap: 40px;
}

.filters_block {
    width: 300px;
}

.events_base {
    display: flex;
    flex-direction: column;
    gap: 20px;

    flex: 1;
}

.events {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    grid-gap: 16px;
}

@media (max-width: 420px) {
    .events {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    }
}
</style>
