<script>
import { defineComponent, toRefs, onMounted, computed, watch, ref } from "vue"
import * as d3 from "d3"

/**
 * UI
 */
import Button from "@/components/ui/Button"

/**
 * Local
 */
import MarketStatus from "./MarketStatus"

/**
 * Services
 */
import { numberWithSymbol, calcChange } from "@/services/utils/amounts"
import { supportedMarkets } from "@/services/config"
import { prepareQuotesForD3 } from "@/services/utils/quotes"

/**
 * Store
 */
import { useMarketStore } from "@/store/market"

export default defineComponent({
    name: "MarketCard",
    props: {
        market: Object,
    },

    setup(props) {
        const { market } = toRefs(props)
        const marketStore = useMarketStore()

        const quotes = computed(() => {
            return marketStore.markets[market.value.symbol]?.quotes
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

            if (!market.value.historyPrice) return { text: "Loading" }

            const { diff, percent, isIncreased } = calcChange(
                quotes.value[0].price,
                market.value.historyPrice,
            )
            color.value = isIncreased ? "green" : "red"

            return {
                text: `${numberWithSymbol(
                    diff.toFixed(2),
                    ",",
                )}, ${percent.toFixed(2)}%, 1W`,
                trend: isIncreased ? "rise" : "fall",
            }
        })

        const draw = () => {
            const margin = { top: 20, right: 20, bottom: 20, left: 0 },
                width = 500 - margin.left - margin.right,
                height = 140 - margin.top - margin.bottom

            d3.select(`#chart_${market.value.id} > *`).remove()

            const svg = d3
                .select(`#chart_${market.value.id}`)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`)

            const data = prepareQuotesForD3({ quotes: quotes.value })

            const x = d3
                .scaleTime()
                .domain(d3.extent(data, (d) => d.date))
                .range([0, width])

            const y = d3
                .scaleLinear()
                .domain([
                    d3.min(data, (d) => +d.value),
                    d3.max(data, (d) => +d.value),
                ])
                .range([height, 0])

            svg.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr(
                    "stroke",
                    change.value.trend == "rise" ? "#1aa168" : "#e05c43",
                )
                .attr("stroke-width", 1.5)
                .attr(
                    "d",
                    d3
                        .line()
                        .x((d) => x(d.date))
                        .y((d) => y(d.value)),
                )

            svg.append("circle")
                .attr("cx", x(data[data.length - 1].date))
                .attr("cy", y(data[data.length - 1].value))
                .attr("r", 2)
                .attr("fill", "#fff")

            /** animated circle */
            svg.append("circle")
                .attr("id", "animated_circle")
                .attr("cx", x(data[data.length - 1].date))
                .attr("cy", y(data[data.length - 1].value))
                .attr("fill", "rgba(255,255,255,0.07)")
                .attr("stroke", "rgba(255,255,255, 0.5)")
                .attr("stroke-width", "2px")

            svg.select("#animated_circle")
                .html(`<animate id="ac1" attributeType="SVG" attributeName="r" begin="1s;ac1.end+2s" dur="1.5s" from="1%" to="10%" />
              <animate id="ac2" attributeType="CSS" attributeName="stroke-width" begin="1s;ac2.end+2s"  dur="1.5s" from="2px" to="0px" />
              <animate id="ac3" attributeType="CSS" attributeName="opacity" begin="1s;ac3.end+2s"  dur="1.5s" from="1" to="0" />`)
        }

        onMounted(() => {
            if (quotes.value.length) {
                draw()
            }
        })

        watch(change, () => {
            if (change.value.text == "Loading") return

            draw()
        })

        /**
         * Select quote on hover
         */
        let selectedQuote = ref({})

        const selectedPrice = computed(() => {
            return {
                integer: numberWithSymbol(
                    selectedQuote.value.value.toString().split(".")[0],
                    ",",
                ),
                fraction: selectedQuote.value.value.toString().split(".")[1],
            }
        })

        const onMouseMove = ({ layerX }) => {
            const data = prepareQuotesForD3({ quotes: quotes.value })

            const xScale = d3
                .scaleTime()
                .domain(d3.extent(data, (d) => d.date))
                .range([0, 500])

            const exactDate = xScale.invert(layerX)
            const diffs = data.map((d) => Math.abs(d.date - exactDate))
            const snapIndex = diffs.indexOf(Math.min(...diffs))

            selectedQuote.value = data[snapIndex]

            /** draw dots */
            const circles = d3.selectAll(
                `#chart_${market.value.id} > svg > line`,
            )
            circles.remove()

            const svg = d3.select(`#chart_${market.value.id} > svg`)
            svg.append("line")
                .attr("x1", layerX)
                .attr("x2", layerX)
                .attr("y1", 140)
                .attr("y2", 0)
                .attr("stroke", "rgba(255,255,255, 0.5)")
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "2 8")
        }
        const onMouseLeave = () => {
            selectedQuote.value = {}

            const circles = d3.selectAll(
                `#chart_${market.value.id} > svg > line`,
            )
            circles.remove()
        }

        return {
            change,
            color,
            quotes,
            price,
            selectedPrice,
            numberWithSymbol,
            supportedMarkets,
            onMouseMove,
            onMouseLeave,
            selectedQuote,
        }
    },

    components: { MarketStatus, Button },
})
</script>

<template>
    <div :class="$style.wrapper">
        <div :class="$style.header">
            <div :class="$style.left">
                <h3 :class="$style.symbol">
                    {{ market.symbol }}

                    <MarketStatus />
                </h3>
                <div :class="$style.description">
                    {{ supportedMarkets[market.symbol].description }}
                </div>
            </div>

            <!-- Current price -->
            <div v-if="!selectedQuote.value" :class="$style.right">
                <div v-if="quotes.length" :class="$style.price">
                    {{ price.integer
                    }}<span>.{{ price.fraction.slice(0, 2) }} USD</span>
                </div>

                <div
                    v-if="quotes.length && change"
                    :class="[$style.diff, $style[color]]"
                >
                    <Icon name="carret" size="12" /> {{ change.text }}
                </div>
            </div>
            <!-- Selected quote -->
            <div v-else :class="$style.right">
                <div :class="$style.price">
                    {{ selectedPrice.integer
                    }}<span>.{{ selectedPrice.fraction.slice(0, 2) }} USD</span>
                </div>

                <div :class="$style.date">
                    {{
                        new Date(selectedQuote.date)
                            .toLocaleTimeString()
                            .split(":")
                            .slice(0, 2)
                            .join(":")
                    }}
                </div>
            </div>
        </div>

        <div :class="$style.chart">
            <div
                :id="`chart_${market.id}`"
                @mousemove="onMouseMove"
                @mouseleave="onMouseLeave"
            />
        </div>

        <div :class="$style.bottom">
            <div :class="$style.actions">
                <router-link
                    :to="`/markets/${market.symbol}`"
                    :class="$style.action"
                    >Open Market</router-link
                >
            </div>

            <div :class="$style.timeframe">
                <Icon name="bolt" size="12" />Real-time
            </div>
        </div>
    </div>
</template>

<style module>
.wrapper {
    background: var(--card-bg);
    border-radius: 10px;
    border: 1px solid var(--border);

    padding: 20px;
}

.header {
    display: flex;
    justify-content: space-between;
}

.symbol {
    display: flex;
    align-items: center;
    gap: 8px;
}

.description {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-tertiary);

    margin-top: 8px;
}

.right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.price {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);

    min-height: 20px;

    margin-bottom: 6px;
}

.price span {
    font-size: 12px;
    color: var(--text-tertiary);
}

.diff {
    display: flex;
    align-items: center;
    gap: 6px;

    font-size: 12px;
    font-weight: 500;
    color: var(--green);

    fill: var(--green);
}

.diff.grey {
    color: rgba(255, 255, 255, 0.3);
    fill: rgba(255, 255, 255, 0.3);
}

.diff.green {
    color: var(--green);
    fill: var(--green);
}

.diff.red {
    color: var(--red);
    fill: var(--red);
}

.diff.red svg {
    transform: rotate(180deg);
}

.date {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-tertiary);
}

.chart {
    display: flex;
    align-items: center;
    justify-content: flex-end;

    overflow: hidden;

    position: relative;

    height: 140px;
    margin: 12px 0 0 0;

    background-image: radial-gradient(var(--dot) 1.5px, transparent 0px);
    background-size: 10px 10px;
}

.chart > div {
    /* See #15 and https://github.com/w3c/uievents/issues/135 */
    position: relative;
}

.timer {
    display: flex;
    align-items: center;
    gap: 4px;

    font-size: 12px;
    font-weight: 500;
    color: var(--text-tertiary);

    fill: var(--opacity-20);
}

.wrapper:hover .actions {
    opacity: 1;
}

.bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;

    margin-top: 16px;
}

.actions {
    display: flex;
    align-items: center;
    gap: 12px;

    opacity: 0.5;

    transition: opacity 0.2s ease;
}

.action {
    font-size: 12px;
    line-height: 1;
    font-weight: 600;
    color: var(--blue);
    cursor: pointer;
}

.timeframe {
    display: flex;
    align-items: center;
    gap: 8px;

    padding: 4px 6px 4px 4px;
    border-radius: 6px;
    border: 1px solid var(--border);

    font-size: 12px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-tertiary);
}

.timeframe svg {
    fill: var(--opacity-20);
}

.dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--border);
}
</style>
