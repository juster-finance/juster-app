<script>
import { defineComponent, reactive, inject, onMounted } from "vue"
import { useMeta } from "vue-meta"

/**
 * Local
 */
import Market from "./Market"

/**
 * UI
 */
import Breadcrumbs from "@/components/ui/Breadcrumbs"

/**
 * Store
 */
import { useMarketStore } from "@/store/market"

export default defineComponent({
    name: "MarketsBase",

    setup() {
        const breadcrumbs = reactive([
            {
                name: "All Markets",
                path: "/markets",
            },
        ])

        const amplitude = inject("amplitude")

        const marketStore = useMarketStore()

        onMounted(() => {
            amplitude.logEvent("onPage", { name: "Markets" })
        })

        /** Meta */
        useMeta({
            title: "All Markets",
            description:
                "Available markets for events, for providing liquidity and accepting bets from users",
        })

        return { breadcrumbs, marketStore }
    },

    components: {
        Market,
        Breadcrumbs,
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

        <h1 :class="$style.title">Available Markets</h1>
        <div :class="$style.description">
            List of all currency pairs available for betting
        </div>

        <transition name="fade">
            <div v-if="marketStore.isMarketsLoaded" :class="$style.markets">
                <Market
                    v-for="market in marketStore.markets"
                    :key="market.id"
                    :market="market"
                />
            </div>
        </transition>
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
}

.markets {
    display: flex;
    flex-direction: column;
    gap: 8px;

    margin-top: 24px;
}
</style>
