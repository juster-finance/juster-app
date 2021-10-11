<script>
import { defineComponent, ref, toRefs, computed } from "vue"

/**
 * UI
 */
import Button from "@/components/ui/Button"

/**
 * Services
 */
import { numberWithSymbol, calcChange } from "@/services/utils/amounts"
import { supportedSymbols } from "@/services/config"

/**
 * Store
 */
import { useMarketStore } from "@/store/market"

export default defineComponent({
    name: "Symbol",
    props: { symbol: Object },

    setup(props, context) {
        const { symbol } = toRefs(props)

        const marketStore = useMarketStore()
        const quotes = computed(() => {
            return marketStore.symbols[symbol.value.symbol].quotes
        })

        const price = computed(() => {
            return {
                integer: numberWithSymbol(
                    quotes.value[0].price.toString().split(".")[0],
                    ",",
                ),
                fraction: quotes.value[0].price.toString().split(".")[1],
            }
        })

        const color = ref("grey")
        const change = computed(() => {
            if (!quotes.value) return

            if (!symbol.value.historyPrice) return "Loading"

            const { diff, percent, isIncreased } = calcChange(
                quotes.value[0].price,
                symbol.value.historyPrice,
            )
            color.value = isIncreased ? "green" : "red"

            return `${numberWithSymbol(
                diff.toFixed(2),
                " ",
            )} • ${percent.toFixed(2)}%`
        })

        const handleJoin = () => {
            context.emit("onJoin")
        }

        return {
            symbol,
            quotes,
            change,
            color,
            price,
            supportedSymbols,
            handleJoin,
        }
    },

    components: { Button },
})
</script>

<template>
    <router-link :to="`/symbols/${symbol.symbol}`" :class="$style.wrapper">
        <div :class="$style.base">
            <div :class="$style.name">
                {{ symbol.symbol }},
                <span>{{ supportedSymbols[symbol.symbol].description }}</span>
            </div>

            <h1 v-if="quotes.length" :class="$style.price">
                $ {{ price.integer
                }}<span>.{{ price.fraction.slice(0, 2) }}</span>
            </h1>

            <div :class="[$style.diff, $style[color]]">
                <Icon v-if="change !== 'Loading'" name="carret" size="12" />{{
                    change
                }}
            </div>
        </div>

        <div :class="$style.right">
            <div :class="$style.actions">
                <Button size="medium" type="tertiary" disabled>
                    <Icon name="chart" size="16" />
                    View chart
                </Button>
                <Button size="medium" type="tertiary" disabled>
                    <Icon name="liquidity" size="16" />
                    Liquidity
                </Button>
                <Button @click="handleJoin" size="medium" type="secondary">
                    <Icon name="bolt" size="16" />
                    Join the event
                </Button>
            </div>

            <div :class="$style.info">
                <div :class="$style.param">
                    <span>Events:</span>
                    <span>{{ symbol.totalEvents }}</span>
                </div>

                <div :class="$style.dot" />

                <div :class="$style.param">
                    <span>TVL:</span>
                    <span>{{ symbol.totalValueLocked.toFixed(0) }} XTZ</span>
                </div>

                <div :class="$style.dot" />

                <div :class="$style.param">
                    <span>Volume (24h):</span>
                    <span>{{ symbol.totalVolume.toFixed(0) }} XTZ</span>
                </div>
            </div>
        </div>
    </router-link>
</template>

<style module>
.wrapper {
    padding: 24px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--card-bg);
    min-height: 132px;

    display: flex;
    justify-content: space-between;
    align-items: center;

    transition: border 0.2s ease;
}

.wrapper:hover {
    border: 1px solid var(--border-highlight);
}

.name {
    font-size: 12px;
    font-weight: 500;
    line-height: 1;
    color: var(--text-primary);

    margin-bottom: 20px;
}

.name span {
    color: var(--text-tertiary);
}

.price {
    margin-bottom: 12px;
}

.price span {
    color: var(--text-tertiary);
}

.diff {
    font-size: 13px;
    font-weight: 600;
    line-height: 1;

    width: fit-content;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px;
    border-radius: 5px;
}

.diff.grey {
    color: rgba(255, 255, 255, 0.3);
}

.diff.green {
    color: var(--green);
    fill: var(--green);
    background: rgba(26, 161, 104, 0.15);
}

.diff.red {
    color: var(--red);
    fill: var(--red);
    background: rgba(224, 92, 67, 0.15);
}

.diff.red svg {
    transform: rotate(180deg);
}

.right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: space-between;
    gap: 45px;
}

.actions {
    display: flex;
    gap: 6px;
}

.info {
    display: flex;
    align-items: center;
    gap: 20px;
}

.param {
    display: flex;
    align-items: flex-end;
    gap: 4px;

    font-size: 13px;
    line-height: 1;
    font-weight: 500;
}

.param span:first-child {
    color: var(--text-tertiary);
}

.param span:last-child {
    color: var(--text-primary);
}

.dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--opacity-20);
}
</style>
