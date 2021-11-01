<script>
import {
    defineComponent,
    ref,
    reactive,
    onBeforeUnmount,
    toRefs,
    useCssModule,
    onMounted,
} from "vue"
import { DateTime } from "luxon"
import * as d3 from "d3"

/**
 * API
 */
import { fetchQuotesBySymbol, fetchQuoteByRange } from "@/api/quotes"

/**
 * Services
 */
import { prepareQuotesForD3 } from "@/services/utils/quotes"
import { gql } from "@/services/tools"

export default defineComponent({
    name: "EventChart",
    props: { event: Object },

    setup(props) {
        const { event } = toRefs(props)

        const classes = useCssModule()

        const isOpen = ref(true)

        const symbol = reactive({ quotes: [] })
        const subscription = ref({})

        /**
         * Chart
         */
        const scale = reactive({
            x: null,
            y: null,
        })
        const startData = ref([])

        const draw = () => {
            const margin = { top: 20, right: 100, bottom: 30, left: 0 },
                width = `100%`,
                height = 194 - margin.top - margin.bottom

            d3.select(`#chart > *`).remove()

            const canvas = d3
                .select(`#chart`)
                .append("svg")
                .attr("width", width)
                .attr("height", height + margin.top + margin.bottom)

            const chart = canvas
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`)

            const data = prepareQuotesForD3({ quotes: symbol.quotes })

            scale.x = d3
                .scaleTime()
                .domain(d3.extent(data, d => d.date))
                .range([0, canvas.node().getBoundingClientRect().width - 130])

            scale.y = d3
                .scaleLinear()
                .domain([
                    d3.min(data, d => +d.value),
                    d3.max(data, d => +d.value),
                ])
                .range([height, 0])

            /** Price line */
            startData.value = data.find(
                d =>
                    new Date(d.date).getTime() ==
                    new Date(event.value.betsCloseTime).getTime(),
            )

            const startLine = canvas
                .append("g")
                .attr(
                    "transform",
                    `translate(${scale.x(
                        new Date(event.value.betsCloseTime),
                    )}, ${scale.y(startData.value.value) + margin.top})`,
                )

            startLine
                .append("line")
                .attr("x1", `100%`)
                .attr("class", classes.start_price_line)

            /** Ticks */
            scale.x.ticks(10).forEach(tick => {
                const tickG = canvas
                    .append("g")
                    .attr("transform", `translate(${scale.x(tick)}, 0)`)

                tickG
                    .append("line")
                    .attr("y2", 170)
                    .attr("class", classes.time_line)

                const format = d3.timeFormat("%H:%M")

                if (
                    DateTime.fromISO(event.value.betsCloseTime).ordinal ==
                        DateTime.fromJSDate(tick).ordinal &&
                    DateTime.fromISO(event.value.betsCloseTime).hour ==
                        DateTime.fromJSDate(tick).hour &&
                    DateTime.fromJSDate(tick).minute == 0
                ) {
                    tickG.attr("class", classes.start)

                    tickG
                        .append("text")
                        .attr("y", 190)
                        .text("Start")
                } else if (
                    DateTime.fromJSDate(tick).ordinal ==
                        DateTime.fromISO(event.value.betsCloseTime).plus({
                            hour: event.value.measurePeriod / 3600,
                        }).ordinal &&
                    DateTime.fromJSDate(tick).hour ==
                        DateTime.fromISO(event.value.betsCloseTime).plus({
                            hour: event.value.measurePeriod / 3600,
                        }).hour &&
                    DateTime.fromJSDate(tick).minute == 0
                ) {
                    tickG.attr("class", classes.start)

                    tickG
                        .append("text")
                        .attr("y", 190)
                        .text("Finish")
                } else {
                    tickG
                        .append("text")
                        .attr("y", 190)
                        .text(format(tick))
                }
            })

            /** Chart */
            chart
                .append("path")
                .datum(data)
                .attr("fill", "none")
                .attr(
                    "stroke",
                    event.value.winnerBets == "ABOVE_EQ"
                        ? "#1aa168"
                        : "#e05c43",
                )
                .attr("stroke-width", 1.5)
                .attr(
                    "d",
                    d3
                        .line()
                        .x(d => scale.x(d.date))
                        .y(d => scale.y(d.value)),
                )

            /** Circle - Current Price */
            chart
                .append("circle")
                .attr("cx", scale.x(data[data.length - 1].date))
                .attr("cy", scale.y(data[data.length - 1].value))
                .attr("r", 2)
                .attr("fill", "#fff")

            const currentData = data.find(
                d =>
                    new Date(d.date).getTime() ==
                    new Date(symbol.quotes[0].timestamp).getTime(),
            )

            canvas
                .append("g")
                .append("line")
                .attr("x1", `100%`)
                .attr("class", classes.current_price_line)
                .attr(
                    "transform",
                    `translate(0, ${scale.y(currentData.value) + 20})`,
                )

            /** animated circle */
            if (event.value.status !== "FINISHED") {
                chart
                    .append("circle")
                    .attr("id", "animated_circle")
                    .attr("cx", scale.x(data[data.length - 1].date))
                    .attr("cy", scale.y(data[data.length - 1].value))
                    .attr("fill", "rgba(255,255,255,0.07)")
                    .attr("stroke", "rgba(255,255,255, 0.5)")
                    .attr("stroke-width", "2px")

                chart.select("#animated_circle")
                    .html(`<animate id="ac1" attributeType="SVG" attributeName="r" begin="1s;ac1.end+2s" dur="1.5s" from="1%" to="5%" />
              <animate id="ac2" attributeType="CSS" attributeName="stroke-width" begin="1s;ac2.end+2s"  dur="1.5s" from="2px" to="0px" />
              <animate id="ac3" attributeType="CSS" attributeName="opacity" begin="1s;ac3.end+2s"  dur="1.5s" from="1" to="0" />`)
            }
        }

        /**
         * Mouse Handler
         */
        let selectedQuote = ref({})
        const onMouseMove = ({ layerX, layerY }) => {
            const data = prepareQuotesForD3({ quotes: symbol.quotes })

            const exactDate = scale.x.invert(layerX)
            const diffs = data.map(d => Math.abs(d.date - exactDate))
            const snapIndex = diffs.indexOf(Math.min(...diffs))

            selectedQuote.value = data[snapIndex]

            const circles = d3.selectAll(`#chart > svg > #mouse_line`)
            circles.remove()

            const svg = d3
                .select(`#chart > svg`)
                .append("g")
                .attr("id", "mouse_line")
            svg.append("line")
                .attr("x1", layerX)
                .attr("x2", layerX)
                .attr("y1", 170)
                .attr("y2", 0)
                .attr("stroke", "rgba(255,255,255, 0.8)")
                .attr("stroke-width", 1)
                .attr("stroke-dasharray", "4 4")

            svg.append("line")
                .attr("x1", `100%`)
                .attr("x2", 0)
                .attr("y1", layerY)
                .attr("y2", layerY)
                .attr("stroke", "rgba(255,255,255, 0.8)")
                .attr("stroke-width", 1)
                .attr("stroke-dasharray", "4 4")
        }
        const onMouseLeave = () => {
            selectedQuote.value = {}

            const circles = d3.selectAll(`#chart > svg > #mouse_line`)
            circles.remove()
        }

        onMounted(async () => {
            const quotes = await fetchQuoteByRange({
                id: event.value.currencyPair.id,
                tsGt: DateTime.fromISO(event.value.betsCloseTime)
                    .minus({ hour: 1, minute: 30 })
                    .toJSDate(),
                tsLt: DateTime.fromISO(event.value.betsCloseTime)
                    .plus({
                        hour: parseInt(event.value.measurePeriod) / 3600 + 1,
                    })
                    .toJSDate(),
            })

            symbol.quotes = [...quotes]

            draw()

            if (event.value.status !== "FINISHED") {
                subscription.value = await gql
                    .subscription({
                        quotesWma: [
                            {
                                where: {
                                    currencyPairId: {
                                        _eq: event.value.currencyPair.id,
                                    },
                                },
                                order_by: { timestamp: "desc" },
                                limit: 1,
                            },
                            {
                                currencyPairId: true,
                                price: true,
                                timestamp: true,
                            },
                        ],
                    })
                    .subscribe({
                        next: data => {
                            const newQuote = data.quotesWma[0]

                            if (
                                !symbol.quotes.some(
                                    quote =>
                                        quote.timestamp == newQuote.timestamp,
                                )
                            ) {
                                symbol.quotes.unshift(newQuote)
                                draw()
                            }
                        },
                        error: console.error,
                    })
            }
        })

        onBeforeUnmount(() => {
            if (
                subscription.value.hasOwnProperty("closed") &&
                !subscription.value?.closed
            ) {
                subscription.value.unsubscribe()
                d3.select(`#chart > *`).remove()
            }
        })

        return { isOpen, scale, symbol, startData, onMouseMove, onMouseLeave }
    },
})
</script>

<template>
    <div :class="$style.wrapper">
        <div @click="isOpen = !isOpen" :class="$style.header">
            <div :class="$style.title">Chart</div>

            <Icon name="arrow" size="20" :class="!isOpen && $style.rotate" />
        </div>

        <div v-show="isOpen" :class="$style.base">
            <!-- Chart -->
            <div
                @mousemove="onMouseMove"
                @mouseleave="onMouseLeave"
                id="chart"
                :class="$style.chart"
            />

            <!-- Elements -->
            <div v-if="scale.x" :class="$style.price_axis">
                <!-- Current Price -->
                <div
                    :class="$style.price_badge"
                    :style="{
                        top: `${scale.y(symbol.quotes[0].price) +
                            20 -
                            25 / 2}px`,
                    }"
                >
                    <div :class="$style.dot" />
                    $
                    {{ parseFloat(symbol.quotes[0].price).toFixed(2) }}
                </div>

                <!-- Start Price -->
                <div
                    :class="$style.price_badge"
                    :style="{
                        top: `${scale.y(startData.value) + 20 - 25 / 2}px`,
                    }"
                >
                    <Icon name="go" size="10" />
                    $
                    {{ (parseFloat(event.startRate) * 100).toFixed(2) }}
                </div>
            </div>
        </div>
    </div>
</template>

<style module>
.wrapper {
    background: var(--card-bg);
    border-radius: 8px;
    border: 1px solid var(--border);
    padding: 4px;
    flex: 1;
}

.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    padding: 12px 16px 12px 16px;
    border-radius: 6px;

    transition: background 0.15s ease;
}

.header:hover {
    background: var(--opacity-05);
}

.title {
    font-size: 14px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-primary);
}

.header svg {
    fill: var(--icon);

    transition: transform 0.2s ease;
}

.header svg.rotate {
    transform: rotate(180deg);
}

.base {
    display: flex;
    position: relative;

    margin: 16px;
}

.chart {
    position: relative;
    width: 100%;
    min-height: 190px;
}

.price_axis {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
}

.price_badge {
    position: absolute;
    top: 20px;
    right: 0;

    display: flex;
    align-items: center;
    gap: 6px;

    width: fit-content;
    border: 1px solid var(--border);
    background: var(--card-bg);
    padding: 4px 6px;
    border-radius: 6px;

    font-size: 12px;
    font-weight: 600;
    color: var(--text-primary);
    white-space: nowrap;
}

.price_badge svg {
    fill: var(--green);
}

.price_badge .dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--blue);
}

.time_line {
    stroke: rgba(255, 255, 255, 0.1);
    stroke-dasharray: 8, 8;
    stroke-width: 1;
}

.chart text {
    font-size: 10px;
    line-height: 1;
    font-weight: 600;
    fill: var(--text-tertiary);

    text-anchor: middle;
}

.start text {
    fill: rgba(255, 255, 255, 0.8);
}

.start line {
    stroke: rgba(255, 255, 255, 0.3);
    stroke-width: 1.5;
}

.start_price_line {
    stroke: rgba(255, 255, 255, 0.3);
    stroke-dasharray: 8, 8;
    stroke-width: 1.5;
}

.current_price_line {
    stroke: #fff;
    stroke-dasharray: 8, 8;
    stroke-width: 1;
}
</style>
