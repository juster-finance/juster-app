<script>
import {
    defineComponent,
    ref,
    onMounted,
    onBeforeUnmount,
    toRefs,
    useCssModule,
    watch,
} from "vue"
import { DateTime } from "luxon"
import * as d3 from "d3"

/**
 * API
 */
import { fetchQuotesBySymbol } from "@/api/quotes"

/**
 * Services
 */
import { prepareQuotesForD3 } from "@/services/utils/quotes"

export default defineComponent({
    name: "EventChart",
    props: { event: Object },

    setup(props) {
        const { event } = toRefs(props)

        const classes = useCssModule()

        const isOpen = ref(true)

        const quotes = ref([])

        const draw = () => {
            const margin = { top: 20, right: 20, bottom: 30, left: 0 },
                width = 784 - margin.left - margin.right,
                height = 190 - margin.top - margin.bottom

            d3.select(`#chart > *`).remove()

            const canvas = d3
                .select(`#chart`)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)

            const chart = canvas
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`)

            const data = prepareQuotesForD3({ quotes: quotes.value })

            // const test = []
            // let startFromDt = DateTime.fromISO(
            //     event.value.betsCloseTime,
            // ).minus({ hour: 5 })
            // for (let index = 0; index < 10; index++) {
            //     test.push(startFromDt.toJSDate())
            //     startFromDt = startFromDt.plus({ minute: 30 })
            // }
            // console.log(test)

            const xScale = d3
                .scaleTime()
                .domain(d3.extent(data, d => d.date))
                .range([0, width])

            const yScale = d3
                .scaleLinear()
                .domain([
                    d3.min(data, d => +d.value),
                    d3.max(data, d => +d.value),
                ])
                .range([height, 0])

            /** Ticks */
            xScale.ticks(10).forEach(tick => {
                const tickG = canvas
                    .append("g")
                    .attr("transform", `translate(${xScale(tick)}, 0)`)

                tickG.append("line").attr("y2", 170)

                const format = d3.timeFormat("%H:%M")

                if (
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
                .attr("stroke", "#1aa168")
                .attr("stroke-width", 1.5)
                .attr(
                    "d",
                    d3
                        .line()
                        .x(d => xScale(d.date))
                        .y(d => yScale(d.value)),
                )

            chart
                .append("circle")
                .attr("cx", xScale(data[data.length - 1].date))
                .attr("cy", yScale(data[data.length - 1].value))
                .attr("r", 2)
                .attr("fill", "#fff")

            /** animated circle */
            chart
                .append("circle")
                .attr("id", "animated_circle")
                .attr("cx", xScale(data[data.length - 1].date))
                .attr("cy", yScale(data[data.length - 1].value))
                .attr("fill", "rgba(255,255,255,0.07)")
                .attr("stroke", "rgba(255,255,255, 0.5)")
                .attr("stroke-width", "2px")

            chart.select("#animated_circle")
                .html(`<animate id="ac1" attributeType="SVG" attributeName="r" begin="1s;ac1.end+2s" dur="1.5s" from="1%" to="5%" />
              <animate id="ac2" attributeType="CSS" attributeName="stroke-width" begin="1s;ac2.end+2s"  dur="1.5s" from="2px" to="0px" />
              <animate id="ac3" attributeType="CSS" attributeName="opacity" begin="1s;ac3.end+2s"  dur="1.5s" from="1" to="0" />`)
        }

        onMounted(async () => {
            const test1 = await fetchQuotesBySymbol({ id: 4, limit: 100 })
            const test2 = await fetchQuotesBySymbol({
                id: 4,
                limit: 100,
                offset: 100,
            })
            const test3 = await fetchQuotesBySymbol({
                id: 4,
                limit: 100,
                offset: 200,
            })
            const test4 = await fetchQuotesBySymbol({
                id: 4,
                limit: 100,
                offset: 300,
            })

            quotes.value = [...test1, ...test2, ...test3, ...test4]

            if (event.value) draw()
        })

        watch(event, () => {
            if (quotes.value.length) draw()
        })

        onBeforeUnmount(() => {
            quotes.value = []
        })

        return { isOpen }
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
            <div id="chart" :class="$style.chart"></div>
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
    padding: 16px;
}

.chart {
    height: 190px;
}

.chart line {
    stroke: rgba(255, 255, 255, 0.1);
    stroke-dasharray: 6, 6;
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
    fill: var(--blue);
}

.start line {
    stroke: var(--blue);
}
</style>
