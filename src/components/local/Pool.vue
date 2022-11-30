<script setup>
/**
 * Vendor
 */
import { computed } from "vue"

const props = defineProps({
	event: Object,
})

const abovePercent = computed(() => {
	return Math.floor(
		(props.event.poolAboveEq * 100) /
			(props.event.poolAboveEq + props.event.poolBelow),
	)
})

const belowPercent = computed(() => {
	return Math.ceil(
		(props.event.poolBelow * 100) /
			(props.event.poolAboveEq + props.event.poolBelow),
	)
})
</script>

<template>
	<div :class="$style.wrapper">
		<div :class="$style.head">
			<div :class="[$style.name, $style.rise]">
				<Icon name="price_event" size="14" />Rise<span
					v-if="abovePercent"
				>
					{{ abovePercent }}%</span
				>
			</div>

			<div :class="[$style.name, $style.fall]">
				<span v-if="belowPercent">{{ belowPercent }}% </span>Fall
				<Icon name="price_event" size="14" />
			</div>
		</div>

		<div :class="$style.pool">
			<div
				:style="{ width: `${abovePercent}%` }"
				:class="[$style.fill, $style.higher]"
			/>
			<div
				:style="{ width: `${belowPercent}%` }"
				:class="[$style.fill, $style.lower]"
			/>
		</div>
	</div>
</template>

<style module>
.wrapper {
}

.head {
	display: flex;
	align-items: center;
	justify-content: space-between;

	margin-bottom: 12px;
}

.name {
	font-size: 14px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-secondary);

	display: flex;
	align-items: center;
	gap: 8px;
}

.name span {
	color: var(--text-tertiary);
}

.name.rise svg {
	fill: var(--green);
}

.name.fall svg {
	fill: var(--orange);
	transform: rotateX(180deg);
}

.pool {
	position: relative;

	width: 100%;
	height: 6px;

	border-radius: 50px;
	background: var(--opacity-10);
	opacity: 0.8;

	overflow: hidden;
}

.fill {
	position: absolute;
	top: 0;
	bottom: 0;
	width: 0%;

	height: 6px;

	transition: width 0.5s ease;
}

.fill.higher {
	left: 0;
	background: var(--green);
}

.fill.lower {
	right: 0;
	background: var(--orange);
}
</style>
