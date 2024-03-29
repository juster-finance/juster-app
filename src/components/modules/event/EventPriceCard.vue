<script setup>
import { computed } from "vue"

/**
 * Services
 */
import { disaggregate } from "@utils/amounts"
import { DateTime } from "luxon"

const props = defineProps({
	event: { type: Object },
	price: { type: Object },
	finishTime: { type: Object },
})

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
	<Flex direction="column" gap="24" :class="$style.wrapper">
		<Text color="primary" size="16" height="12" weight="600"> Price </Text>

		<Flex direction="column" gap="10">
			<div :class="$style.prices">
				<div :class="$style.side">
					<Icon name="go" size="12" />

					<div v-if="event.status == 'NEW'" :class="$style.price">TBD</div>
					<div v-else :class="$style.price">
						{{ disaggregate(event.startRate * 100)[0] }}.<span>{{ disaggregate(event.startRate * 100)[1] }}</span>
					</div>
				</div>

				<div :class="[$style.dots, event.status == 'STARTED' && finishTime.m > 0 && $style.anim]">
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

					<div v-if="event.status == 'NEW'" :class="$style.price">TBD</div>
					<div v-else-if="event.status == 'STARTED'" :class="$style.price">
						{{ price.integer }}<span>.{{ price.fraction?.slice(0, price.integer < 10 ? 4 : 2) }}</span>
					</div>
					<div v-else-if="event.status == 'FINISHED'" :class="$style.price">
						{{ disaggregate(event.closedRate * 100)[0] }}.<span>{{ disaggregate(event.closedRate * 100)[1] }}</span>
					</div>
				</div>
			</div>

			<div :class="$style.labels">
				<div :class="$style.label">Start price</div>

				<span v-if="event.status == 'STARTED' && finishTime.m > 0">{{ finishTimeText }}</span>
				<span v-if="event.status == 'STARTED' && finishTime.m <= 0">Ending</span>

				<div v-if="['STARTED', 'NEW'].includes(event.status)" :class="$style.label">Current price</div>
				<div v-else-if="event.status == 'FINISHED'" :class="$style.label">Closed price</div>
			</div>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	border-radius: 8px;
	border-top: 3px solid var(--border);
	background: var(--card-bg);

	padding: 20px;
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

@media (max-width: 500px) {
	.dots.anim .dot:nth-child(4) {
		display: none;
	}
	.dots.anim .dot:nth-child(5) {
		display: none;
	}
	.dots.anim .dot:nth-child(6) {
		display: none;
	}
	.dots.anim .dot:nth-child(7) {
		display: none;
	}
	.dots.anim .dot:nth-child(8) {
		display: none;
	}
	.dots.anim .dot:nth-child(9) {
		display: none;
	}
	.dots.anim .dot:nth-child(10) {
		display: none;
	}
}
</style>
