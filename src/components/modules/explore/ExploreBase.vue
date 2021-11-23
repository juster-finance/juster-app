<script>
import { defineComponent, ref, onMounted, computed, onBeforeUnmount } from "vue"
import { useRouter } from "vue-router"
import { useMeta } from "vue-meta"
import { cloneDeep } from "lodash"

/**
 * Local
 */
import SymbolCard from "@/components/local/SymbolCard"
import EventCard from "@/components/local/EventCard"
import EventCardLoading from "@/components/local/EventCardLoading"

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

        const handleViewTopEvents = () => {
            router.push("/events/top")
        }

        onMounted(async () => {
            const topEvents = await fetchTopEvents({ limit: 3 })

            marketStore.events = cloneDeep(topEvents).sort(
                (a, b) => b.bets.length - a.bets.length,
            )
        })
        onBeforeUnmount(() => {
            marketStore.events = []
        })

        /** Meta */
        useMeta({
            title: "Explore",
            description:
                "Juster is an on-chain smart contract platform allowing users to take part in an automated betting market by creating events, providing liquidity to them, and making bets.",
        })

        return {
            marketStore,
            handleViewTopEvents,
        }
    },

    components: { SymbolCard, EventCard, EventCardLoading, Button },
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

            <!-- Hot events -->
            <div :class="$style.block">
                <div :class="$style.head">
                    <div :class="$style.left">
                        <h1>Hot events</h1>
                        <div :class="$style.description">
                            Events that are currently active and in demand
                        </div>
                    </div>

                    <Button
                        @click="handleViewTopEvents"
                        size="small"
                        type="tertiary"
                    >
                        <Icon name="collection" size="16" />
                        All Hot events
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
    font-family: "CalSans";
    letter-spacing: 0.5px;
}

.head {
    display: flex;
    justify-content: space-between;
}

.description {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-tertiary);

    margin-top: 8px;
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
