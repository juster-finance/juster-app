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
    inject,
} from "vue"
import { DateTime } from "luxon"
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
import Pagination from "@/components/ui/Pagination"
import Breadcrumbs from "@/components/ui/Breadcrumbs"
import Banner from "@/components/ui/Banner"
import Button from "@/components/ui/Button"

/**
 * Local
 */
import EventsFilters from "./EventsFilters"
import { EventCard, EventCardLoading } from "@/components/local/EventCard"

/**
 * Store
 */
import { useMarketStore } from "@/store/market"

const defaultFilters = {
    symbols: [
        {
            name: "XTZ-USD",
            active: true,
        },
        {
            name: "BTC-USD",
            active: true,
        },
        {
            name: "ETH-USD",
            active: true,
        },
    ],

    periods: [
        {
            name: "1h",
            active: true,
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
            icon: "event_new",
            color: "green",
            active: true,
        },
        {
            name: "Active",
            icon: "event_active",
            color: "yellow",
            active: false,
        },
        {
            name: "Finished",
            icon: "checkcircle",
            color: "gray",
            active: false,
        },
        {
            name: "Canceled",
            icon: "stop",
            color: "orange",
            active: false,
        },
    ],

    advanced: {
        period: null,
        participants: [],
    },

    misc: {
        startingToday: {
            active: false,
            disabled: false,
        },
        moreThan: {
            active: false,
            disabled: false,
        },
        targetDynamics: {
            active: false,
            disabled: true,
        },
        customEvents: {
            active: false,
            disabled: true,
        },
    },
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

        const amplitude = inject("amplitude")

        const marketStore = useMarketStore()

        const subscription = ref(null)

        const isAllEventsLoaded = ref(false)

        const currentPage = ref(1)

        let filters = ref(cloneDeep(defaultFilters))

        /** reset "currentPage" when changing filters */
        watch(
            filters.value,
            () => {
                currentPage.value = 1
            },
            { deep: true },
        )

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

        const handleSelect = (filter, target) => {
            filters.value[filter].forEach((elem) => {
                if (target.name == elem.name) elem.active = !elem.active
            })
        }

        const handleResetFilters = () => {
            liquidityFilters.min = liquidityRange.min
            liquidityFilters.max = liquidityRange.max

            filters.value = cloneDeep(defaultFilters)
        }

        const handleManageParticipant = ({ address, action }) => {
            if (action == "add") {
                if (filters.value.advanced.participants.includes(address))
                    return

                filters.value.advanced.participants.push(address)
            }

            if (action == "remove") {
                const indexOfAddress =
                    filters.value.advanced.participants.indexOf(address)

                if (indexOfAddress !== -1) {
                    filters.value.advanced.participants.splice(
                        indexOfAddress,
                        1,
                    )
                }
            }
        }

        /** Events */
        const availableEvents = computed(() => {
            return marketStore.events.filter((event) =>
                ["NEW", "STARTED", "FINISHED"].includes(event.status),
            )
        })
        const filteredEvents = computed(() => {
            let events = cloneDeep(marketStore.events)

            /** Filter by Symbol */
            if (filters.value.symbols.some((symbol) => symbol.active)) {
                const selectedSymbols = filters.value.symbols
                    .filter((symbol) => symbol.active)
                    .map((symbol) => symbol.name)

                events = events.filter((event) =>
                    selectedSymbols.includes(event.currencyPair.symbol),
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
                        if (status.name == "Canceled") return "CANCELED"
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
                } else {
                    events = []
                }
            }

            /** Advanced */
            if (filters.value.advanced.period) {
                events = events.filter((event) =>
                    DateTime.fromISO(event.betsCloseTime).hasSame(
                        DateTime.fromFormat(
                            filters.value.advanced.period,
                            "yyyy-mm-dd",
                        ),
                        "day",
                    ),
                )
            }

            if (filters.value.advanced.participants.length) {
                events = events.filter((event) => {
                    const hasBet = event.bets
                        .map((bet) => bet.userId)
                        .some((userId) =>
                            filters.value.advanced.participants.includes(
                                userId,
                            ),
                        )
                    const hasDeposit = event.deposits
                        .map((deposit) => deposit.userId)
                        .some((userId) =>
                            filters.value.advanced.participants.includes(
                                userId,
                            ),
                        )

                    return hasBet || hasDeposit
                })
            }

            /** Filter by Misc */
            if (filters.value.misc.startingToday.active) {
                events = events.filter((event) =>
                    DateTime.fromISO(event.betsCloseTime).hasSame(
                        DateTime.local(),
                        "day",
                    ),
                )
            }

            if (filters.value.misc.moreThan.active) {
                events = events.filter((event) => {
                    let participants = [
                        ...event.bets.map((bet) => bet.userId),
                        ...event.deposits.map((deposit) => deposit.userId),
                    ]

                    /** remove duplicates */
                    participants = [...new Set(participants)]

                    return participants.length > 1
                })
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
            amplitude.logEvent("onPage", { name: "AllEvents" })

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
                subscription.value.hasOwnProperty("_state") &&
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
            currentPage,
            filters,
            liquidityRange,
            liquidityFilters,
            handleNewMin,
            handleNewMax,
            handleSelect,
            handleResetFilters,
            handleManageParticipant,
        }
    },

    components: {
        Breadcrumbs,
        Banner,
        Button,
        Pagination,
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
                @onSelect="handleSelect"
                @onReset="handleResetFilters"
                @onManageParticipant="handleManageParticipant"
                :class="$style.filters_block"
            />

            <div :class="$style.events_base">
                <Banner
                    type="info"
                    v-if="filteredEvents.length == 0 && isAllEventsLoaded"
                >
                    All
                    {{ availableEvents.length - filteredEvents.length }} events
                    hidden due to filters

                    <Button
                        @click="handleResetFilters"
                        type="secondary"
                        size="mini"
                        >Reset filters</Button
                    >
                </Banner>
                <Banner
                    type="info"
                    v-else-if="filteredEvents.length !== availableEvents.length"
                >
                    {{ availableEvents.length - filteredEvents.length }} events
                    hidden due to filters
                </Banner>

                <transition name="fastfade" mode="out-in">
                    <div v-if="filteredEvents.length" :class="$style.events">
                        <EventCard
                            v-for="event in filteredEvents.slice(
                                (currentPage - 1) * 6,
                                currentPage * 6,
                            )"
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

                <Pagination
                    v-if="filteredEvents.length > 6"
                    v-model="currentPage"
                    :total="filteredEvents.length"
                    :limit="6"
                    :class="$style.pagination"
                />
            </div>
        </div>
    </div>
</template>

<style module>
.wrapper {
}

.breadcrumbs {
    margin-bottom: 24px;
}

.description {
    font-size: 14px;
    line-height: 1.6;
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

.pagination {
    margin-top: 16px;
}

@media (max-width: 420px) {
    .events {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    }
}
</style>
