<script>
import {
    defineComponent,
    ref,
    computed,
    watch,
    reactive,
    inject,
    onMounted,
    onBeforeUnmount,
} from "vue"
import { useRoute } from "vue-router"
import { useMeta } from "vue-meta"
import { DateTime } from "luxon"
import { cloneDeep } from "lodash"

/**
 * API
 */
import { fetchEventsBySymbol } from "@/api/events"

/**
 * Local
 */
import Symbol from "./Symbol"
import EventCard from "@/components/local/EventCard"
import EventCardLoading from "@/components/local/EventCardLoading"

/**
 * Store
 */
import { useMarketStore } from "@/store/market"

/**
 * UI
 */
import Button from "@/components/ui/Button"
import Pagination from "@/components/ui/Pagination"
import Breadcrumbs from "@/components/ui/Breadcrumbs"

export default defineComponent({
    name: "SymbolBase",

    setup() {
        const header = ref(null)
        const breadcrumbs = reactive([
            {
                name: "All symbols",
                path: "/symbols",
            },
        ])

        const amplitude = inject("amplitude")

        const currentPage = ref(1)

        /** Symbol */
        const route = useRoute()
        const marketStore = useMarketStore()

        const symbol = computed(() => {
            return Object.keys(marketStore.symbols)
                .map((item) => marketStore.symbols[item])
                .find((item) => item.symbol == route.params.name)
        })
        const price = computed(
            () => marketStore.symbols[symbol.value?.symbol]?.quotes[0]?.price,
        )

        const selectedTab = ref("Available")
        const selectTab = (tab) => {
            currentPage.value = 1
            selectedTab.value = tab
        }

        const events = computed(() => marketStore.events)

        const getEvents = async ({ status }) => {
            marketStore.events = []

            let allEvents = await fetchEventsBySymbol({
                id: symbol.value.id,
                status,
            })

            marketStore.events = cloneDeep(allEvents).sort(
                (a, b) => new Date(b.createdTime) - new Date(a.createdTime),
            )
        }

        if (symbol.value) {
            breadcrumbs.push({
                name: symbol.value.symbol,
                path: `/symbols/${symbol.value.symbol}`,
            })

            getEvents({ status: "NEW" })
        }
        watch(symbol, () => {
            if (!symbol.value) return

            breadcrumbs.push({
                name: symbol.value.symbol,
                path: `/symbols/${symbol.value.symbol}`,
            })

            getEvents({ status: "NEW" })
        })
        watch(selectedTab, () => {
            if (selectedTab.value == "Available") {
                getEvents({ status: "NEW" })
            }
            if (selectedTab.value == "Closed") {
                getEvents({ status: "STARTED" })
            }
            if (selectedTab.value == "Finished") {
                getEvents({ status: "FINISHED" })
            }
        })

        const handleScrollToEvents = () => {
            document.getElementById("app").scrollTo({
                top: header.value.getBoundingClientRect().top - 90,
                behavior: "smooth",
            })
        }

        /** Meta */
        const { meta } = useMeta({
            title: `Symbol`,
            description:
                "Available symbols for events, for providing liquidity and accepting bets from users",
        })

        if (price.value) {
            meta.title = `${symbol.value.symbol} • ${price.value.toFixed(2)}`
        }

        watch(symbol, () => {
            if (!symbol.value) return
            meta.title = `${symbol.value.symbol}`
        })
        watch(
            () => marketStore.symbols,
            () => {
                if (price.value)
                    meta.title = `${symbol.value.symbol}, ${price.value.toFixed(
                        2,
                    )}`
            },
            { deep: true },
        )

        onMounted(() => {
            amplitude.logEvent("onPage", { name: "Symbol" })
        })

        onBeforeUnmount(() => {
            marketStore.events = []
        })

        return {
            header,
            breadcrumbs,
            currentPage,
            DateTime,
            symbol,
            events,
            selectedTab,
            selectTab,
            handleScrollToEvents,
        }
    },

    components: {
        Symbol,
        Breadcrumbs,
        EventCard,
        EventCardLoading,
        Pagination,
        Button,
    },
})
</script>

<template>
    <div v-if="symbol" :class="$style.wrapper">
        <metainfo>
            <template v-slot:title="{ content }"
                >{{ content }} • Juster</template
            >
        </metainfo>

        <Breadcrumbs :crumbs="breadcrumbs" :class="$style.breadcrumbs" />

        <Symbol :symbol="symbol" @onJoin="handleScrollToEvents" />

        <div ref="header" :class="$style.header">
            <div :class="$style.left">
                <div :class="$style.day">
                    <span>Today</span>,
                    {{
                        DateTime.now().toLocaleString({
                            month: "long",
                            day: "numeric",
                        })
                    }}
                </div>

                <div :class="$style.filters">
                    <div
                        @click="selectTab('Available')"
                        :class="[
                            $style.filter,
                            selectedTab == 'Available' && $style.active,
                        ]"
                    >
                        <Icon name="bolt" size="12" />Available for bets
                    </div>
                    <div :class="$style.dot" />
                    <div
                        @click="selectTab('Closed')"
                        :class="[
                            $style.filter,
                            selectedTab == 'Closed' && $style.active,
                        ]"
                    >
                        <Icon name="time" size="12" />In process
                    </div>
                    <div :class="$style.dot" />
                    <div
                        @click="selectTab('Finished')"
                        :class="[
                            $style.filter,
                            selectedTab == 'Finished' && $style.active,
                        ]"
                    >
                        <Icon name="checkcircle" size="12" />Finished
                    </div>
                </div>
            </div>

            <div :class="$style.right">
                <Button icon="filter" type="tertiary" size="small" />
                <Button icon="calendar" type="tertiary" size="small" />
                <Button icon="search" type="tertiary" size="small" />
            </div>
        </div>

        <transition name="fastfade" mode="out-in">
            <div v-if="events.length" :class="$style.events">
                <EventCard
                    v-for="event in events.slice(
                        (currentPage - 1) * 8,
                        currentPage * 8,
                    )"
                    :key="event.id"
                    :event="event"
                />
            </div>

            <div v-else :class="$style.events">
                <EventCardLoading />
                <EventCardLoading />
                <EventCardLoading />
            </div>
        </transition>

        <Pagination
            v-if="events && events.length > 8"
            v-model="currentPage"
            :total="events.length"
            :limit="8"
            :class="$style.pagination"
        />
    </div>
</template>

<style module>
.wrapper {
}

.breadcrumbs {
    margin-bottom: 24px;
}

.symbols {
    display: flex;
    flex-direction: column;
    gap: 8px;

    margin-top: 24px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;

    margin-top: 32px;
}

.day {
    font-size: 12px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-tertiary);
}

.day span {
    color: var(--text-secondary);
}

.filters {
    display: flex;
    align-items: center;
    gap: 14px;

    border-radius: 8px;
    border: 1px solid var(--border);
    height: 32px;
    padding: 0 8px;

    margin-top: 10px;
}

.filters .dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--opacity-10);
}

.filter {
    display: flex;
    align-items: center;
    gap: 6px;

    cursor: pointer;

    font-size: 13px;
    font-weight: 600;
    color: var(--text-tertiary);
    fill: var(--text-tertiary);

    transition: all 0.2s ease;
}

.filter:hover {
    fill: var(--text-primary);
    color: var(--text-primary);
}

.filter.active {
    fill: var(--blue);
    color: var(--text-primary);
}

.right {
    display: flex;
    align-items: center;
    gap: 8px;
}

.events {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    grid-gap: 16px;

    margin-top: 20px;
}

.pagination {
    margin-top: 40px;
}
</style>
