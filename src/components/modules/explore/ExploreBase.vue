<script>
import { defineComponent, ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useMeta } from "vue-meta"
import { cloneDeep } from "lodash"

/**
 * Local
 */
import SymbolCard from "@/components/local/SymbolCard"
import EventCard from "@/components/local/EventCard"

/**
 * UI
 */
import Button from "@/components/ui/Button"

/**
 * API
 */
import { fetchTopEvents } from "@/api/events"

/**
 * Store
 */
import { useMarketStore } from "@/store/market"

export default defineComponent({
    name: "ExploreBase",

    setup() {
        const router = useRouter()

        const marketStore = useMarketStore()

        const events = ref([])

        onMounted(async () => {
            const topEvents = await fetchTopEvents({ limit: 3 })

            events.value = cloneDeep(topEvents).sort(
                (a, b) => b.bets.length - a.bets.length,
            )
        })

        const handleViewTopEvents = () => {
            router.push("/events/top")
        }

        /** Meta */
        useMeta({
            title: "Explore",
            description:
                "Juster is an on-chain smart contract platform allowing users to take part in an automated betting market by creating events, providing liquidity to them, and making bets.",
        })

        return {
            marketStore,
            events,
            handleViewTopEvents,
        }
    },

    components: { SymbolCard, EventCard, Button },
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

            <!-- Top markets -->
            <div v-if="marketStore.isSymbolsLoaded" :class="$style.block">
                <h1>Top markets</h1>
                <div :class="$style.description">
                    Available currency pairs for bets
                </div>

                <div :class="$style.items">
                    <SymbolCard
                        v-for="symbol in marketStore.symbols"
                        :key="symbol.id"
                        :symbol="symbol"
                    />
                </div>
            </div>

            <!-- Top events -->
            <div :class="$style.block">
                <div :class="$style.head">
                    <div :class="$style.left">
                        <h1>Top events</h1>
                        <div :class="$style.description">
                            Events that are currently active and in demand
                        </div>
                    </div>

                    <Button
                        @click="handleViewTopEvents"
                        size="small"
                        type="secondary"
                    >
                        <Icon name="collection" size="16" />
                        View top events
                    </Button>
                </div>

                <div v-if="events.length" :class="$style.items">
                    <EventCard
                        v-for="event in events.slice(0, 3)"
                        :key="event.id"
                        :event="event"
                    />
                </div>
            </div>
        </div>
    </transition>
</template>

<style module>
.wrapper {
}

.block {
    margin-bottom: 40px;
}

.block:last-child {
    margin-bottom: 0;
}

.head {
    display: flex;
    justify-content: space-between;
}

.description {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-tertiary);

    margin-top: 12px;
}

.items {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    grid-gap: 16px;

    margin-top: 24px;
}

@media (max-width: 420px) {
    .items {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    }
}
</style>
