<script>
import { defineComponent, reactive, ref, onMounted, watch, computed } from "vue"
import { useMeta } from "vue-meta"
import { cloneDeep } from "lodash"

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

import EventsFilters from "./EventsFilters"

const defaultFilters = {
    symbols: {
        xtz: false,
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

        /** Filters */
        let filters = ref(cloneDeep(defaultFilters))

        const handleSelectPeriod = target => {
            filters.value.periods.forEach(period => {
                if (target.name == period.name) period.active = !period.active
            })
        }

        const handleResetFilters = () => {
            filters.value = cloneDeep(defaultFilters)
        }

        /** Events */
        const allEvents = ref([])

        const filteredEvents = computed(() => {
            let events = allEvents.value

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

                events = events.filter(event =>
                    symbols.includes(event.currencyPair.symbol),
                )
            }

            /** Filter by Period */
            if (filters.value.periods.length) {
                const periods = filters.value.periods
                    .filter(period => period.active)
                    .map(
                        period =>
                            (period.name == "1h" && 3600) ||
                            (period.name == "6h" && 21600) ||
                            (period.name == "24h" && 86400),
                    )

                if (periods.length) {
                    events = events.filter(event =>
                        periods.includes(event.measurePeriod),
                    )
                }
            }

            return events
        })

        onMounted(async () => {
            let allNewEvents = await fetchAllEvents({
                status: "NEW",
            })

            allEvents.value = cloneDeep(allNewEvents).sort(
                (a, b) => new Date(b.createdTime) - new Date(a.createdTime),
            )
        })

        /** Meta */
        const { meta } = useMeta({
            title: `All events`,
            description: "All available events",
        })

        return {
            breadcrumbs,
            allEvents,
            filteredEvents,
            filters,
            handleSelectPeriod,
            handleResetFilters,
        }
    },

    components: {
        Breadcrumbs,
        Banner,
        EventsFilters,
        EventCard,
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
            Here you can see all possible events and filter
        </div>

        <div :class="$style.container">
            <EventsFilters
                :filters="filters"
                :events="allEvents"
                @onSelectPeriod="handleSelectPeriod"
                @onReset="handleResetFilters"
                :class="$style.filters_block"
            />

            <div :class="$style.events_base">
                <Banner type="warning"
                    >We have temporarily disabled events with a period of 1
                    hour. They will be available again soon.</Banner
                >
                <div :class="$style.events">
                    <EventCard
                        v-for="event in filteredEvents"
                        :key="event.id"
                        :event="event"
                    />
                </div>
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
    line-height: 1;
    font-weight: 500;
    color: var(--text-tertiary);

    margin-top: 12px;
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
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    grid-gap: 16px;
}

@media (max-width: 420px) {
    .events {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    }
}
</style>
