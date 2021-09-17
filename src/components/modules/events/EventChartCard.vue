<script>
import { defineComponent, ref, computed, toRefs } from "vue"

/**
 * Services
 */
import { numberWithSymbol, calcChange } from "@/services/utils/amounts"

/**
 * Store
 */
import { useMarketStore } from "@/store/market"

export default defineComponent({
    name: "EventChartCard",
    props: {
        event: Object,
        price: Object,
    },

    setup(props) {
        const { event } = toRefs(props)

        const marketStore = useMarketStore()

        const quotes = computed(() => {
            return marketStore.symbols[event.value.currency_pair.symbol].quotes
        })

        const color = ref("grey")
        const change = computed(() => {
            if (!quotes.value) return

            if (
                !marketStore.symbols[event.value.currency_pair.symbol]
                    .historyPrice
            )
                return "Loading"

            const { diff, percent, isIncreased } = calcChange(
                quotes.value[0].price,
                marketStore.symbols[event.value.currency_pair.symbol]
                    .historyPrice,
            )
            color.value = isIncreased ? "green" : "red"

            return `${numberWithSymbol(
                diff.toFixed(2),
                " ",
            )}, ${percent.toFixed(2)}%`
        })

        return { change, color }
    },
})
</script>

<template>
    <div :class="$style.wrapper">
        <div :class="$style.params">
            <div :class="$style.param">{{ event.currency_pair.symbol }}</div>
            <div :class="$style.dot" />
            <div :class="$style.param">
                $ {{ price.integer
                }}<span>.{{ price.fraction.slice(0, 2) }}</span>
            </div>
            <div :class="$style.dot" />
            <div :class="[$style.param, $style[color]]">
                <Icon v-if="change !== 'Loading'" name="carret" size="12" />{{
                    change
                }}
            </div>
        </div>
    </div>
</template>

<style module>
.wrapper {
    background: var(--card-bg);
    border-radius: 8px;
    border: 1px solid var(--border);
    padding: 24px;
}

.params {
    display: flex;
    align-items: center;
    gap: 14px;
}

.param {
    display: flex;
    align-items: center;

    font-size: 12px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-primary);
}

.param svg {
    margin-right: 4px;
}

.param.grey {
    color: rgba(255, 255, 255, 0.3);
}

.param.green {
    color: var(--green);
    fill: var(--green);
}

.param.red {
    color: var(--red);
    fill: var(--red);
}

.param.red svg {
    transform: rotate(180deg);
}

.dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--border);
}
</style>
