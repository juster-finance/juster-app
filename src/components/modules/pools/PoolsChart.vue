<script setup>
/**
 * Vendor
 */
import { ref, reactive, onMounted, useCssModule } from "vue"
import * as d3 from "d3"
import { DateTime } from "luxon"

/**
 * API
 */
import { fetchPoolStateByRange } from "@/api/pools"

const props = defineProps({
	pool: Object,
})

const classes = useCssModule()

const data = ref([])
const scale = reactive({
	x: null,
	y: null,
})

const draw = () => {
	const margin = { top: 0, right: 0, bottom: 0, left: 0 },
		width = `100%`,
		height = 260 - margin.top - margin.bottom

	d3.select(`#pool_chart > *`).remove()

	const canvas = d3
		.select(`#pool_chart`)
		.append("svg")
		.attr("width", width)
		.attr("height", height + margin.top + margin.bottom)

	const chart = canvas.append("g").attr("transform", `translate(${margin.left},${margin.top})`)

	scale.x = d3
		.scaleTime()
		.domain(d3.extent(data.value, (d) => d.date))
		.range([0, canvas.node().getBoundingClientRect().width - 100])

	const domain = [d3.min(data.value, (d) => +d.value) - 5, d3.max(data.value, (d) => +d.value) + 5]
	scale.y = d3
		.scaleLinear()
		.domain(domain)
		.range([height - 40, 24])

	const format = d3.timeFormat("%b %d")

	scale.x.ticks(data.value.length).forEach((tick, i) => {
		const tickG = canvas.append("g").attr("transform", `translate(${scale.x(tick)}, 0)`)

		tickG.append("line").attr("y2", 242).attr("class", classes.time_line)

		if (!i) return
		tickG.append("text").attr("y", 260).text(format(tick))
	})

	scale.y.ticks(5).forEach((tick) => {
		const tickG = canvas.append("g").attr("transform", `translate(-10, ${scale.y(tick)})`)

		tickG.append("line").attr("x2", 680).attr("class", classes.value_line)
		tickG.append("text").attr("x", 700).text(tick)
	})

	/**
	 * Changes to the TVL pool that will not change
	 * in the future and will remain unchanged
	 */
	const recordedData = data.value.filter((d) => DateTime.fromJSDate(d.date).startOf("day") < DateTime.now().startOf("day"))

	/** Recorded Chart */
	chart
		.append("path")
		.datum(recordedData)
		.attr("fill", "none")
		.attr("stroke", "#457ee8")
		.attr("stroke-width", 2)
		.attr(
			"d",
			d3
				.line()
				.x((d) => scale.x(d.date))
				.y((d) => scale.y(d.value)),
		)

	const currentData = data.value.slice(0, 2)

	/** Today Line */
	chart
		.append("path")
		.datum(currentData)
		.attr("fill", "none")
		.attr("stroke", "#457ee8")
		.attr("stroke-width", 2)
		.attr("stroke-dasharray", 5)
		.attr(
			"d",
			d3
				.line()
				.x((d) => scale.x(d.date))
				.y((d) => scale.y(d.value)),
		)
	chart
		.append("circle")
		.attr("cx", scale.x(currentData[0].date))
		.attr("cy", scale.y(currentData[0].value))
		.attr("r", 4)
		.attr("fill", "#457ee8")
}

onMounted(async () => {
	const now = DateTime.now()

	for (let i = 1; i <= 9; i++) {
		const states = await fetchPoolStateByRange({
			poolId: props.pool.address,
			tsGt: DateTime.fromObject({
				year: now.year,
				month: now.month,
				day: now.day,
			})
				.minus({ day: i - 1 })
				.toISO(),
			tsLt: DateTime.fromObject({
				year: now.year,
				month: now.month,
				day: now.day,
			})
				.minus({ day: -i })
				.toISO(),
		})

		if (!states.length) continue
		data.value.push({
			value: states.reduce((prev, curr) => (prev += curr.totalLiquidity), 0) / states.length,
			date: new Date(
				DateTime.fromObject({
					year: now.year,
					month: now.month,
					day: now.day,
				}).minus({ day: i - 1 }).ts,
			),
		})
	}

	draw()
})
</script>

<template>
	<Flex direction="column" gap="24" :class="$style.wrapper">
		<Text size="16" weight="600" color="primary"> Chart </Text>

		<div id="pool_chart" :class="$style.chart" />

		<Flex align="end" justify="between">
			<Flex align="center" gap="6">
				<Flex align="center" gap="8" :class="[$style.tab, $style.active]">
					<Icon name="coins" size="14" color="tertiary" />
					<Text size="14" weight="600">TVL</Text>
				</Flex>
			</Flex>

			<Flex align="center" gap="6">
				<div :class="$style.dot" />
				<Text size="12" weight="600" color="secondary">
					{{ pool.name.replace("Juster Pool: ", "") }}
				</Text>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	border-radius: 8px;
	background: var(--card-bg);
	border-top: 3px solid var(--border);

	padding: 24px;
}

.chart {
	position: relative;
	height: 260px;
}

.tab {
	height: 32px;
	border-radius: 6px;
	cursor: pointer;

	color: var(--text-secondary);

	padding: 0 12px;

	transition: color 0.2s ease, background 0.2s ease;
}

.tab:hover {
	color: var(--text-primary);
}

.tab.active {
	background: rgba(255, 255, 255, 0.05);
	color: var(--text-primary);
}

.dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: var(--blue);
}

.time_line {
	stroke: rgba(255, 255, 255, 0.1);
	stroke-dasharray: 8, 8;
	stroke-width: 1;
}

.value_line {
	stroke: rgba(255, 255, 255, 0.05);
	stroke-dasharray: 8, 8;
	stroke-width: 1;
}

.chart text {
	font-size: 11px;
	line-height: 1;
	font-weight: 600;
	fill: var(--text-support);

	text-anchor: middle;
}
</style>
