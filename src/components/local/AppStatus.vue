<script>
import { computed, defineComponent, watch } from "vue"

/**
 * UI
 */
import Spin from "@/components/ui/Spin"

/**
 * Store
 */
import { useMarketStore } from "@/store/market"

export default defineComponent({
    name: "AppStatus",

    setup() {
        const marketStore = useMarketStore()

        const currentState = computed(() => {
            if (!marketStore.isSymbolsLoaded) {
                return "all_symbols"
            }

            if (!marketStore.symbols["BTC-USD"].quotes.length) {
                return "symbol_quotes"
            }

            if (!marketStore.symbols["BTC-USD"].historyPrice) {
                return "historical_price"
            }
        })

        return { marketStore, currentState }
    },

    components: { Spin },
})
</script>

<template>
    <transition name="popup">
        <div v-if="currentState" :class="$style.wrapper">
            <Spin size="16" />

            <transition name="popup" mode="out-in">
                <div v-if="currentState == 'all_symbols'" :class="$style.base">
                    <div :class="$style.name">
                        Fetching
                    </div>

                    <div :class="$style.dot" />

                    <div :class="$style.description">
                        All symbols
                    </div>
                </div>
                <div
                    v-else-if="currentState == 'symbol_quotes'"
                    :class="$style.base"
                >
                    <div :class="$style.name">
                        Fetching
                    </div>

                    <div :class="$style.dot" />

                    <div :class="$style.description">
                        Symbol quotes
                    </div>
                </div>
                <div
                    v-else-if="currentState == 'historical_price'"
                    :class="$style.base"
                >
                    <div :class="$style.name">
                        Fetching
                    </div>

                    <div :class="$style.dot" />

                    <div :class="$style.description">
                        Historical price
                    </div>
                </div>
            </transition>
        </div>
    </transition>
</template>

<style module>
.wrapper {
    display: flex;
    align-items: center;
    gap: 8px;

    background: var(--card-bg);
    border-radius: 50px;
    border: 1px solid var(--border);
    box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.5);
    height: 36px;
    padding: 0 14px 0 10px;
}

.base {
    display: flex;
    align-items: center;
    gap: 8px;
}

.name {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
}

.dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--border);
}

.description {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-tertiary);
}
</style>
