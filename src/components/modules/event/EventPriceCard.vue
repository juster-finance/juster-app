<script setup>
import { computed } from "vue"

/**
 * Services
 */
import { numberWithSymbol } from "@/services/utils/amounts"

const props = defineProps({
	event: { type: Object },
	price: { type: Object },
	finishTime: { type: Object },
})

const disaggregate = (num) => {
	const splittedNum = num.toString().split(".")

	const integer = splittedNum[0]
	const fraction = splittedNum[1].slice(0, 2)

	return [numberWithSymbol(integer, ","), fraction]
}

const finishTimeText = computed(() => {
	let text = ``

	if (props.finishTime.d) {
		text = `${props.finishTime.d}d`
	}
	if (props.finishTime.h) {
		text += ` ${props.finishTime.h}h`
	}
	if (props.finishTime.m) {
		text += ` ${props.finishTime.m}m`
	}

	return text
})
</script>

<template>
	<div :class="$style.wrapper">
		<div :class="$style.title">Price</div>

		<div :class="$style.prices">
			<div :class="$style.side">
				<Icon name="go" size="12" />

				<div v-if="event.status == 'NEW'" :class="$style.price">
					TBD
				</div>
				<div v-else :class="$style.price">
					{{ disaggregate(event.startRate * 100)[0] }}.<span>{{
						disaggregate(event.startRate * 100)[1]
					}}</span>
				</div>
			</div>

			<div
				:class="[$style.dots, event.status == 'STARTED' && $style.anim]"
			>
				<div :class="$style.dot" />
				<div :class="$style.dot" />
				<div :class="$style.dot" />
				<div :class="$style.dot" />
				<div :class="$style.dot" />
				<div :class="$style.dot" />
				<div :class="$style.dot" />
				<div :class="$style.dot" />
				<div :class="$style.dot" />
				<div :class="$style.dot" />
			</div>

			<div :class="$style.side">
				<Icon
					:name="event.status == 'STARTED' ? 'bolt' : 'flag'"
					size="12"
					:class="[event.status == 'STARTED' && $style.active]"
				/>

				<div v-if="event.status == 'NEW'" :class="$style.price">
					TBD
				</div>
				<div
					v-else-if="event.status == 'STARTED'"
					:class="$style.price"
				>
					{{ price.integer
					}}<span>.{{ price.fraction?.slice(0, 2) }}</span>
				</div>
				<div
					v-else-if="event.status == 'FINISHED'"
					:class="$style.price"
				>
					{{ disaggregate(event.closedRate * 100)[0] }}.<span>{{
						disaggregate(event.closedRate * 100)[1]
					}}</span>
				</div>
			</div>
		</div>

		<div :class="$style.labels">
			<div :class="$style.label">Start price</div>

			<span v-if="event.status == 'STARTED' && finishTime.m > 0">{{
				finishTimeText
			}}</span>
			<span v-if="event.status == 'STARTED' && finishTime.m <= 0"
				>Ending</span
			>

			<div
				v-if="['STARTED', 'NEW'].includes(event.status)"
				:class="$style.label"
			>
				Current price
			</div>
			<div v-else-if="event.status == 'FINISHED'" :class="$style.label">
				Closed price
			</div>
		</div>
	</div>
</template>

<style module>
.wrapper {
	border-radius: 8px;
	border: 1px solid var(--border);
	padding: 20px;
	background: var(--card-bg);
}

.title {
	font-size: 14px;
	line-height: 1;
	font-weight: 500;
	color: var(--text-primary);

	margin-bottom: 20px;
}

.prices {
	display: Flex;
	align-items: center;
	justify-content: space-between;

	margin-bottom: 10px;
}

.side {
	display: flex;
	align-items: center;
	gap: 8px;
}

.side svg {
	fill: var(--text-tertiary);
}

.side svg.active {
	fill: var(--blue);
}

.price {
	font-size: 16px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-primary);
}

.price span {
	color: var(--text-tertiary);
}

.labels {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.label {
	font-size: 12px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-tertiary);
}

.labels span {
	font-size: 12px;
	line-height: 1;
	font-weight: 500;
	color: var(--text-tertiary);
}

.dots {
	display: flex;
	align-items: center;
	gap: 8px;
}

.dot {
	width: 4px;
	height: 4px;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.08);
}

.dots.anim .dot:nth-child(1) {
	animation: mig 1.5s ease 0s infinite;
}
.dots.anim .dot:nth-child(2) {
	animation: mig 1.5s ease 0.25s infinite;
}
.dots.anim .dot:nth-child(3) {
	animation: mig 1.5s ease 0.5s infinite;
}
.dots.anim .dot:nth-child(4) {
	animation: mig 1.5s ease 0.75s infinite;
}
.dots.anim .dot:nth-child(5) {
	animation: mig 1.5s ease 1s infinite;
}
.dots.anim .dot:nth-child(6) {
	animation: mig 1.5s ease 1.25s infinite;
}
.dots.anim .dot:nth-child(7) {
	animation: mig 1.5s ease 1.5s infinite;
}
.dots.anim .dot:nth-child(8) {
	animation: mig 1.5s ease 1.75s infinite;
}
.dots.anim .dot:nth-child(9) {
	animation: mig 1.5s ease 2s infinite;
}
.dots.anim .dot:nth-child(10) {
	animation: mig 1.5s ease 2.25s infinite;
}

@keyframes mig {
	0% {
		background: rgba(255, 255, 255, 0.1);
	}
	40% {
		background: rgba(255, 255, 255, 1);
	}
	80% {
		background: rgba(255, 255, 255, 0.1);
	}
	100% {
		background: rgba(255, 255, 255, 0.1);
	}
}
</style>
