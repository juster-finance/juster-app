<script>
import {
	defineComponent,
	ref,
	reactive,
	toRefs,
	onMounted,
	onBeforeUnmount,
	useCssModule,
} from "vue"
import * as d3 from "d3"
import { DateTime } from "luxon"

/**
 * API
 */
import { fetchEventTVL } from "@/api/quotes"

/**
 * Services
 */
import { juster } from "@sdk"

export default defineComponent({
	name: "EventTVLChart",
	props: {
		event: Object,
	},

	setup(props) {
		const { event } = toRefs(props)
		const classes = useCssModule()

		const symbol = reactive({ tvl: [] })
		const subscription = ref({})

		/**
		 * Chart
		 */
		const scale = reactive({
			x: null,
			y: null,
		})

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

			const data = symbol.tvl.map((el) => {
				return { value: el.cumSum, date: new Date(el.createdTime) }
			})

			scale.x = d3
				.scaleTime()
				.domain(d3.extent(data, (d) => d.date))
				.range([0, canvas.node().getBoundingClientRect().width - 130])
			scale.y = d3
				.scaleLinear()
				.domain([
					d3.min(data, (d) => +d.value),
					d3.max(data, (d) => +d.value),
				])
				.range([height, 0])

			/** Ticks */
			scale.x.ticks(10).forEach((tick) => {
				const format = d3.timeFormat("%H:%M")

				const tickG = canvas
					.append("g")
					.attr("transform", `translate(${scale.x(tick)}, 0)`)

				tickG
					.append("line")
					.attr("y2", 170)
					.attr("class", classes.time_line)

				tickG.append("text").attr("y", 190).text(format(tick))
			})

			/** Chart */
			chart
				.append("path")
				.datum(data)
				.attr("fill", "none")
				.attr("stroke", "#fff")
				.attr("stroke-width", 1.5)
				.attr(
					"d",
					d3
						.line()
						.x((d) => scale.x(d.date))
						.y((d) => scale.y(d.value)),
				)
		}

		/**
		 * Mouse Handler
		 */
		let selectedQuote = ref({})
		const onMouseMove = ({ layerX, layerY }) => {
			return /** temp. disabled */

			const data = prepareQuotesForD3({ quotes: symbol.quotes })

			const exactDate = scale.x.invert(layerX)
			const diffs = data.map((d) => Math.abs(d.date - exactDate))
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
			const tvl = await fetchEventTVL({
				id: event.value.id,
			})

			symbol.tvl = [...tvl]

			draw()

			if (event.value.status !== "FINISHED") {
				subscription.value = await juster.gql
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
						next: (data) => {
							const newQuote = data.quotesWma[0]

							if (
								!symbol.quotes.some(
									(quote) =>
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
				subscription.value.hasOwnProperty("_state") &&
				!subscription.value?.closed
			) {
				subscription.value.unsubscribe()
				d3.select(`#chart > *`).remove()
			}
		})

		return {
			scale,
			onMouseMove,
			onMouseLeave,
		}
	},
})
</script>

<template>
	<div :class="$style.wrapper">
		<!-- Chart -->
		<div
			@mousemove="onMouseMove"
			@mouseleave="onMouseLeave"
			id="chart"
			:class="$style.chart"
		/>
	</div>
</template>

<style module>
.wrapper {
}

.chart {
	position: relative;
	width: 100%;
	min-height: 190px;
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
	fill: var(--text-blue);
}

.start line {
	stroke: var(--blue);
	stroke-width: 1.5;
}

.start_price_line {
	stroke: rgba(255, 255, 255, 0.8);
	stroke-dasharray: 10, 10;
	stroke-width: 1.5;
}

.current_price_line {
	stroke: rgba(255, 255, 255, 0.3);
	stroke-dasharray: 8, 8;
	stroke-width: 1;
}
</style>
