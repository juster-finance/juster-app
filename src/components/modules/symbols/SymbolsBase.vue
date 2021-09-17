<script>
import { defineComponent, reactive } from "vue"
import { useMeta } from "vue-meta"

/**
 * Local
 */
import Symbol from "./Symbol"

/**
 * UI
 */
import Breadcrumbs from "@/components/ui/Breadcrumbs"

/**
 * Store
 */
import { useMarketStore } from "@/store/market"

export default defineComponent({
    name: "SymbolsBase",

    setup() {
        const breadcrumbs = reactive([
            {
                name: "All symbols",
                path: "/symbols",
            },
        ])

        const marketStore = useMarketStore()

        /** Meta */
        useMeta({
            title: "All Symbols",
            description:
                "Available symbols for events, for providing liquidity and accepting bets from users",
        })

        return { breadcrumbs, marketStore }
    },

    components: {
        Symbol,
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

        <h1>Available symbols</h1>
        <div :class="$style.description">
            List of all current and archived events
        </div>

        <transition name="fade">
            <div v-if="marketStore.isSymbolsLoaded" :class="$style.symbols">
                <Symbol
                    v-for="symbol in marketStore.symbols"
                    :key="symbol.id"
                    :symbol="symbol"
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
    font-weight: 500;
    color: var(--text-tertiary);

    margin-top: 8px;
}

.symbols {
    display: flex;
    flex-direction: column;
    gap: 8px;

    margin-top: 24px;
}
</style>
