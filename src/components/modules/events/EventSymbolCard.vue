<script>
import { defineComponent, ref, computed, toRefs } from "vue"
import { useRouter } from "vue-router"

/**
 * Services
 */
import { numberWithSymbol, calcChange } from "@/services/utils/amounts"
import { supportedSymbols } from "@/services/config"

/**
 * Local
 */
import SymbolStatus from "@/components/local/SymbolStatus"

/**
 * Store
 */
import { useMarketStore } from "@/store/market"

export default defineComponent({
    name: "EventSymbolCard",
    props: {
        event: Object,
        price: Object,
    },

    setup(props) {
        const { event } = toRefs(props)
        const router = useRouter()

        const marketStore = useMarketStore()

        const quotes = computed(() => {
            return marketStore.symbols[event.value.currency_pair.symbol].quotes
        })
        const symbol = computed(() => event.value.currency_pair.symbol)

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

        const openSymbol = () => {
            router.push(`/symbols/${symbol.value}`)
        }

        return { change, color, symbol, supportedSymbols, openSymbol }
    },

    components: { SymbolStatus },
})
</script>

<template>
    <div @click="openSymbol" :class="$style.wrapper">
        <div :class="$style.left">
            <span
                ><img
                    v-if="symbol.split('-')[0] == 'XTZ'"
                    src="@/assets/symbols/tz.png"/>
                <img
                    v-if="symbol.split('-')[0] == 'ETH'"
                    src="@/assets/symbols/eth.png"/>
                <img
                    v-if="symbol.split('-')[0] == 'BTC'"
                    src="@/assets/symbols/btc.png"/>
                {{ event.currency_pair.symbol }} <SymbolStatus
            /></span>

            <span>{{ supportedSymbols[symbol].description }}</span>
        </div>

        <div :class="$style.right">
            <span>
                $ {{ price.integer
                }}<span>.{{ price.fraction.slice(0, 2) }}</span></span
            >
            <span :class="$style[color]"
                ><Icon name="carret" size="12" /> {{ change }}</span
            >
        </div>
    </div>
</template>

<style module>
.wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;

    cursor: pointer;
    background: var(--card-bg);
    border-radius: 8px;
    border: 1px solid var(--border);
    padding: 20px;
}

.left {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
}

.left span:first-child {
    display: flex;
    align-items: center;
    gap: 6px;

    font-size: 14px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-primary);
}

.left span:first-child img {
    width: 20px;
    height: 20px;
    border-radius: 6px;
    opacity: 0.7;
}

.left span:last-child {
    font-size: 12px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-tertiary);
}

.right span:first-child {
    display: flex;

    font-size: 14px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-primary);
}

.right span:first-child span {
    color: var(--text-tertiary);
}

.right span:last-child {
    display: flex;
    align-items: center;
    gap: 4px;

    font-size: 12px;
    line-height: 1;
    font-weight: 500;
}

.right span:last-child.red {
    color: var(--red);
    fill: var(--red);
}

.right span:last-child.red svg {
    transform: rotate(180deg);
}

.right span:last-child.green {
    color: var(--green);
    fill: var(--green);
}

.right span:last-child.grey {
    color: var(--opacity-20);
    fill: var(--opacity-20);
}
</style>
