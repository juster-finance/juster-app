<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, useCssModule, computed, nextTick } from "vue"
import * as d3 from "d3"
import { DateTime } from "luxon"

/**
 * API
 */
import { fetchQuoteByRange } from "@/api/quotes"

/**
 * Services
 */
import { prepareQuotesForD3 } from "@utils/quotes"
import { disaggregate } from "@utils/amounts"
import { juster } from "@sdk"

/**
 * UI
 */
import Banner from "@ui/Banner.vue"
import LoadingDots from "@ui/LoadingDots.vue"

const props = defineProps({ event: { type: Object, default: () => {} }, priceDynamics: { type: Object } })

const classes = useCssModule()

const symbol = reactive({ quotes: [], isQuotesLoaded: false })
const subscription = ref({})

/**
 * Chart
 */
const scale = reactive({
	x: null,
	y: null,
})
const startData = ref([])
const currentQuote = ref({})

// const priceDynamics = computed(() => {
// 	const startRate = props.event.startRate
// 	const closedRate = props.event.closedRate

// 	if (!symbol.quotes.length) return 0

// 	const diff = props.event.status == "FINISHED" ? closedRate - startRate : symbol.quotes[0].price - startRate

// 	return diff
// })

const draw = () => {
	if (!symbol.quotes.length) return

	const chartEars = {
		hour: 0,
		minute: 0,
	}

	let quotes = []
	
	/** <1h */
	if (props.event.measurePeriod < 3600) {
		chartEars.hour = 0
		chartEars.minute = 30

		quotes = symbol.quotes
	}

	/** 1h */
	if (props.event.measurePeriod == 3600) {
		chartEars.hour = 1
		chartEars.minute = 0

		quotes = symbol.quotes
	}

	/** 6h */
	if (props.event.measurePeriod == 21600) {
		chartEars.hour = 6
		chartEars.minute = 30

		quotes = symbol.quotes.filter((q) => {
			const mins = []
			;[...Array(13).keys()].forEach((a) => {
				mins.push(a * 5)
			})
			return mins.includes(DateTime.fromISO(q.timestamp).minute)
		})
	}

	/** 24h */
	if (props.event.measurePeriod == 86400) {
		chartEars.hour = 24
		chartEars.minute = 0

		quotes = symbol.quotes.filter((q) => [30, 0].includes(DateTime.fromISO(q.timestamp).minute))
	}

	/** 7d */
	if (props.event.measurePeriod == 604800) {
		chartEars.hour = 24 * 7
		chartEars.minute = 0

		quotes = symbol.quotes.filter((q) => {
			const hours = []
			;[...Array(24).keys()].forEach((a) => {
				hours.push(a)
			})
			return hours.includes(DateTime.fromISO(q.timestamp).hour)
		})
	}

	quotes.unshift(symbol.quotes[0])

	const margin = { top: 20, right: 100, bottom: 30, left: 0 },
		width = `100%`,
		height = 240 - margin.top - margin.bottom

	d3.select(`#price_chart > *`).remove()

	const canvas = d3
		.select(`#price_chart`)
		.append("svg")
		.attr("width", width)
		.attr("height", height + margin.top + margin.bottom)

	const chart = canvas.append("g").attr("transform", `translate(${margin.left},${margin.top})`)

	let data = prepareQuotesForD3({ quotes: quotes })

	/** Simplify the data for 7d */
	if (props.event.measurePeriod == 604800) {
		const lastQuote = data[data.length - 1]
		data = data.filter((quote) => DateTime.fromJSDate(quote.date).minute % 60 == 0)
		data.push(lastQuote)
	}

	let eventPeriod = [
		{
			date: DateTime.fromISO(props.event.betsCloseTime)
				.minus({
					hour: chartEars.hour,
					minute: chartEars.minute,
				})
				.toJSDate(),
		},
	]

	for (let index = 1; index <= props.event.measurePeriod / 60 + chartEars.hour * 60 + chartEars.minute; index++) {
		eventPeriod.push({
			date: DateTime.fromJSDate(eventPeriod[eventPeriod.length - 1].date)
				.plus({ minute: 1 })
				.toJSDate(),
		})
	}

	scale.x = d3
		.scaleTime()
		.domain(d3.extent(eventPeriod, (d) => d.date))
		.range([0, canvas.node().getBoundingClientRect().width - 130])
	scale.y = d3
		.scaleLinear()
		.domain([d3.min(data, (d) => +d.value), d3.max(data, (d) => +d.value)])
		.range([height, 10])

	/** Price line */
	startData.value = data.find((d) => new Date(d.date).getTime() == new Date(props.event.betsCloseTime).getTime())

	if (startData.value) {
		const startLine = canvas
			.append("g")
			.attr("transform", `translate(${scale.x(new Date(props.event.betsCloseTime))}, ${scale.y(startData.value.value) + margin.top})`)

		startLine.append("line").attr("x1", `100%`).attr("class", classes.start_price_line)
	}

	/** Ticks */
	const format = d3.timeFormat("%H:%M")

	scale.x.ticks(15).forEach((tick) => {
		const tickG = canvas
			.append("g")
			.attr("transform", `translate(${scale.x(tick)}, 12)`)
			.attr("id", "xTick")
			.attr("data-value", DateTime.fromISO(tick).ts)

		if (
			DateTime.fromISO(props.event.betsCloseTime).ordinal == DateTime.fromJSDate(tick).ordinal &&
			DateTime.fromISO(props.event.betsCloseTime).hour == DateTime.fromJSDate(tick).hour &&
			DateTime.fromISO(props.event.betsCloseTime).minute == DateTime.fromJSDate(tick).minute
		) {
			tickG.attr("id", "sector_start")
			const eventStartDt = DateTime.fromISO(props.event.betsCloseTime)

			tickG.attr("class", classes.start)

			const startLine = tickG.append("line").attr("y2", 200).attr("class", classes.time_line)
			startLine.attr("y1", 24)

			tickG.append("text").attr("y", 0).text(`Start`)
			tickG.append("text").attr("y", 12).text(eventStartDt.toFormat("H:mm"))
			tickG.append("text").attr("y", 220).text(format(tick))
		} else if (
			DateTime.fromJSDate(tick).ordinal ==
				DateTime.fromISO(props.event.betsCloseTime).plus({
					seconds: props.event.measurePeriod,
				}).ordinal &&
			DateTime.fromJSDate(tick).hour ==
				DateTime.fromISO(props.event.betsCloseTime).plus({
					seconds: props.event.measurePeriod,
				}).hour &&
			DateTime.fromJSDate(tick).minute == DateTime.fromISO(props.event.betsCloseTime).plus({
					seconds: props.event.measurePeriod,
				}).minute
		) {
			const eventFinishDt = DateTime.fromISO(props.event.betsCloseTime).plus({
				seconds: props.event.measurePeriod,
			})

			tickG.attr("class", classes.start)

			const finishLine = tickG.append("line").attr("y2", 200).attr("class", classes.time_line)
			finishLine.attr("y1", 24)

			tickG.append("text").attr("y", 0).text(`Finish`)
			tickG.append("text").attr("y", 12).text(eventFinishDt.toFormat("H:mm"))
			tickG.append("text").attr("y", 220).text(format(tick))
		} else {
			tickG.append("line").attr("y2", 200).attr("class", classes.time_line)

			if (![0, 15, 30, 45].includes(DateTime.fromJSDate(tick).minute)) return

			if (format(tick) == "00:00") {
				tickG.append("text").attr("y", 220).text(DateTime.fromJSDate(tick).toFormat("LLL dd"))
			} else {
				tickG.append("text").attr("y", 220).text(format(tick))
			}
		}
	})

	/** Find Start / Finish for specific "measurePeriod" events */
	if (!canvas.select("#sector_start").size()) {
		/**
		 * Start
		 */
		const eventStartDt = DateTime.fromISO(props.event.betsCloseTime)
		const startTickValue = scale.x(eventStartDt.ts)

		const startTickG = canvas.append("g").attr("transform", `translate(${startTickValue}, 12)`)
		startTickG.attr("class", classes.start)

		const startLine = startTickG.append("line").attr("y2", 200).attr("class", classes.time_line)
		startLine.attr("y1", 24)

		startTickG.append("text").attr("y", 0).text(`Start`)
		startTickG.append("text").attr("y", 12).text(eventStartDt.toFormat("H:mm"))

		/**
		 * Finish
		 */
		const eventFinishDt = DateTime.fromISO(props.event.betsCloseTime).plus({
			seconds: props.event.measurePeriod,
		})
		const finishTickValue = scale.x(eventFinishDt)

		const finishTickG = canvas.append("g").attr("transform", `translate(${finishTickValue}, 12)`)
		finishTickG.attr("class", classes.start)

		const finishLine = finishTickG.append("line").attr("y2", 200).attr("class", classes.time_line)
		finishLine.attr("y1", 24)

		finishTickG.append("text").attr("y", 0).text(`Finish`)
		finishTickG.append("text").attr("y", 12).text(eventFinishDt.toFormat("H:mm"))
	}

	/** Draw chart Before start */
	const dataBeforeStart = data.filter((quote) => DateTime.fromJSDate(quote.date).ts <= DateTime.fromISO(props.event.betsCloseTime).ts)

	chart
		.append("path")
		.datum(dataBeforeStart)
		.attr("fill", "none")
		.attr("stroke", "#707070")
		.attr("stroke-width", 1.5)
		.attr(
			"d",
			d3
				.line()
				.x((d) => scale.x(d.date))
				.y((d) => scale.y(d.value)),
		)

	/** Draw chart After start */
	const dataAfterStart = data.filter((quote) => DateTime.fromJSDate(quote.date).ts >= DateTime.fromISO(props.event.betsCloseTime).ts)
	chart
		.append("path")
		.datum(dataAfterStart)
		.attr("fill", "none")
		.attr(
			"stroke",
			(props.priceDynamics.diff > 0 && "#1aa168") ||
				(props.priceDynamics.diff < 0 && "#e05c43") ||
				(props.priceDynamics.diff == 0 && "#707070"),
		)
		.attr("stroke-width", 1.5)
		.attr(
			"d",
			d3
				.line()
				.x((d) => scale.x(d.date))
				.y((d) => scale.y(d.value)),
		)

	/** Circle - Current Price */
	currentQuote.value = prepareQuotesForD3({ quotes: symbol.quotes }).find(
		(d) => d.date.getTime() == new Date(symbol.quotes[0].timestamp).getTime(),
	)

	if (currentQuote.value) {
		chart
			.append("circle")
			.attr("cx", scale.x(currentQuote.value.date))
			.attr("cy", scale.y(currentQuote.value.value))
			.attr("r", 2)
			.attr("fill", "#fff")

		canvas
			.append("g")
			.append("line")
			.attr("x1", `100%`)
			.attr("class", classes.current_price_line)
			.attr("transform", `translate(0, ${scale.y(currentQuote.value.value) + 20})`)
	}

	/** animated circle */
	if (props.event.status !== "FINISHED" && currentQuote.value) {
		chart
			.append("circle")
			.attr("id", "animated_circle")
			.attr("cx", scale.x(currentQuote.value.date))
			.attr("cy", scale.y(currentQuote.value.value))
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
	return /** temp. disabled */

	const data = prepareQuotesForD3({ quotes: symbol.quotes })

	const exactDate = scale.x.invert(layerX)
	const diffs = data.map((d) => Math.abs(d.date - exactDate))
	const snapIndex = diffs.indexOf(Math.min(...diffs))

	selectedQuote.value = data[snapIndex]

	const circles = d3.selectAll(`#price_chart > svg > #mouse_line`)
	circles.remove()

	const svg = d3.select(`#price_chart > svg`).append("g").attr("id", "mouse_line")
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

	const circles = d3.selectAll(`#price_chart > svg > #mouse_line`)
	circles.remove()
}

const getQuotes = async (tsGt, tsLt, ears) => {
	const rawQuotes = await fetchQuoteByRange({
		id: props.event.currencyPair.id,
		tsGt: tsGt.toJSDate(),
		tsLt: tsLt.toJSDate(),
	})

	return rawQuotes
}

const fillQuotes = async (tsGt) => {
	if (!symbol.quotes.length) return

	const lastQuoteDt = DateTime.fromISO(symbol.quotes[symbol.quotes.length - 1].timestamp)

	if (lastQuoteDt.ts !== tsGt.ts) {
		const rawQuotes = await getQuotes(tsGt, lastQuoteDt)

		let newQuotes = [...rawQuotes]

		newQuotes.shift()

		symbol.quotes = [...symbol.quotes, ...newQuotes]

		if (!newQuotes.length) return

		if (DateTime.fromISO(newQuotes[newQuotes.length - 1].timestamp).ts !== tsGt.ts) {
			await fillQuotes(tsGt)
		}
	}
}

onMounted(async () => {
	const chartEars = {
		hour: 0,
		minute: 0,
	}

	/** <1h */
	if (props.event.measurePeriod < 3600) {
		chartEars.hour = 0
		chartEars.minute = 30
	}

	/** 1h */
	if (props.event.measurePeriod == 3600) {
		chartEars.hour = 1
		chartEars.minute = 0
	}

	/** 6h */
	if (props.event.measurePeriod == 21600) {
		chartEars.hour = 6
		chartEars.minute = 30
	}

	/** 24h */
	if (props.event.measurePeriod == 86400) {
		chartEars.hour = 24
		chartEars.minute = 0
	}

	/** 7d */
	if (props.event.measurePeriod == 604800) {
		chartEars.hour = 24 * 7
		chartEars.minute = 0
	}

	const quotes = await getQuotes(
		DateTime.fromISO(props.event.betsCloseTime).minus({
			hour: chartEars.hour,
			minute: chartEars.minute,
		}),
		DateTime.fromISO(props.event.betsCloseTime).plus({
			seconds: parseInt(props.event.measurePeriod)
		}),
		chartEars,
	)

	symbol.quotes = [...quotes]

	await fillQuotes(
		DateTime.fromISO(props.event.betsCloseTime).minus({
			hour: chartEars.hour,
			minute: chartEars.minute,
		}),
	)

	symbol.isQuotesLoaded = true

	nextTick(() => {
		draw()
	})

	if (props.event.status !== "FINISHED") {
		subscription.value = await juster.gql
			.subscription({
				quotesWma: [
					{
						where: {
							currencyPairId: {
								_eq: props.event.currencyPair.id,
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
						DateTime.fromISO(props.event.betsCloseTime).plus({
							second: props.event.measurePeriod,
						}).ts == DateTime.fromISO(newQuote.timestamp).ts ||
						DateTime.fromISO(newQuote.timestamp).ts >
							DateTime.fromISO(props.event.betsCloseTime).plus({
								second: props.event.measurePeriod,
							}).ts
					) {
						subscription.value.unsubscribe()
						return
					}

					if (!symbol.quotes.some((quote) => quote.timestamp == newQuote.timestamp) && symbol.quotes.length) {
						symbol.quotes.unshift(newQuote)

						draw()
					}
				},
				error: console.error,
			})
	}
})
onBeforeUnmount(() => {
	if (subscription.value.hasOwnProperty("_state") && !subscription.value?.closed) {
		subscription.value.unsubscribe()
	}

	d3.select(`#price_chart > *`).remove()
})
</script>

<template>
	<div :class="$style.wrapper">
		<Flex v-if="!symbol.isQuotesLoaded" align="center" justify="center" gap="12" :class="$style.loading_block">
			<LoadingDots />
			<Text size="13" weight="500" color="tertiary">Chart loading</Text>
		</Flex>

		<Banner v-else-if="symbol.isQuotesLoaded && !symbol.quotes.length" icon="help" color="gray">
			Quotes for the event are not yet available, please wait for the pre-launch period
		</Banner>

		<template v-else>
			<!-- Chart -->
			<div @mousemove="onMouseMove" @mouseleave="onMouseLeave" id="price_chart" :class="$style.chart" />

			<!-- Elements -->
			<div v-if="scale.x" :class="$style.price_axis">
				<!-- Current Price -->
				<Flex
					v-if="currentQuote.value"
					:class="[$style.price_badge, $style.current, event.status === 'FINISHED' && $style.finished]"
					:style="{
						top: `${scale.y(currentQuote.value) + 20 - 47 / 2}px`,
					}"
					gap="6"
				>
					<Icon
						:name="event.status === 'FINISHED' ? 'flag' : 'bolt'"
						size="10"
						:color="event.status === 'FINISHED' ? 'tertiary' : 'blue'"
					/>

					<Flex direction="column" gap="6" align="end">
						<Flex v-if="event.status === 'FINISHED'" align="center">
							<Text size="12" weight="600" color="secondary">
								{{ disaggregate(event.closedRate)[0] }}
							</Text>
							<Text size="12" weight="600" color="tertiary"> .{{ disaggregate(event.closedRate)[1] }} </Text>
						</Flex>
						<Flex v-else align="center">
							<Text size="12" weight="600" color="secondary">
								{{ disaggregate(currentQuote.value)[0] }}
							</Text>
							<Text size="12" weight="600" color="tertiary"> .{{ disaggregate(currentQuote.value)[1] }} </Text>
						</Flex>

						<Flex v-if="['STARTED', 'FINISHED'].includes(event.status)" align="center" gap="4">
							<Icon
								name="arrow_circle_top"
								size="10"
								:color="priceDynamics.diff < 0 ? 'red' : 'green'"
								:style="{ transform: `rotate(${priceDynamics.diff < 0 && '180deg'})` }"
							/>
							<Text size="11" weight="600" :color="priceDynamics.diff < 0 ? 'red' : 'green'">
								{{ priceDynamics.percent.toFixed(2) }}%
							</Text>
						</Flex>
						<Text v-else size="11" weight="600" color="tertiary">
							{{ DateTime.fromJSDate(currentQuote.date).toFormat("HH:mm") }}
						</Text>
					</Flex>
				</Flex>

				<!-- Start Price -->
				<Flex
					v-if="startData && event.startRate"
					:class="[$style.price_badge, $style.start]"
					:style="{
						top: `${scale.y(startData.value) + 20 - 30 / 2}px`,
					}"
					gap="6"
				>
					<Icon name="go" size="10" color="secondary" />

					<Flex align="center">
						<Text size="12" weight="600" color="secondary">
							{{ disaggregate(event.startRate)[0] }}
						</Text>
						<Text size="12" weight="600" color="tertiary"> .{{ disaggregate(event.startRate)[1] }} </Text>
					</Flex>
				</Flex>
			</div>
		</template>
	</div>
</template>

<style module>
.wrapper {
}

.chart {
	display: flex;
	position: relative;
	width: 100%;
	min-height: 240px;
}

.price_axis {
	position: absolute;
	top: 0;
	bottom: 0;
	right: 0;
}

.price_badge {
	position: absolute;
	top: 0;
	right: 0;

	width: fit-content;

	background: rgb(30 30 32);
	border: 1px solid var(--border);
	box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
	border-radius: 8px;

	padding: 8px;
}

.price_badge:hover {
	z-index: 2;
}

.price_badge.current {
	color: var(--text-primary);
	fill: var(--blue);

	z-index: 1;
}

.price_badge.start {
	color: var(--text-tertiary);
	fill: var(--green);
}

.price_badge.finished {
	color: var(--text-secondary);
	fill: var(--text-tertiary);
}
.price_badge .dot {
	width: 4px;
	height: 4px;
	border-radius: 50%;
	background: var(--blue);
}

.time_line {
	stroke: rgba(255, 255, 255, 0.1);
	stroke-dasharray: 6, 12;
	stroke-width: 1;
}

.chart text {
	font-size: 10px;
	line-height: 1;
	font-weight: 600;
	fill: var(--text-support);

	text-anchor: middle;
}

.start text:nth-child(2) {
	fill: var(--text-tertiary);
}

.start text:nth-child(3) {
	fill: var(--text-blue);
}

.start line {
	stroke: rgba(69, 126, 232, 0.3);
	stroke-width: 1.5;
}

.start_price_line {
	stroke: rgba(255, 255, 255, 0.3);
	stroke-dasharray: 2, 8;
	stroke-width: 2;
}

.current_price_line {
	stroke: var(--blue);
	stroke-dasharray: 4, 4;
	stroke-width: 1;
}

.loading_block {
	height: 240px;
}
</style>
