<script setup>
defineProps({
	size: { type: String, default: "small" },
	color: { type: String, default: "gray" },
})
</script>

<template>
	<div :class="[$style.wrapper, $style[color], $style[size]]">
		<slot />
	</div>
</template>

<style module>
.wrapper {
	display: flex;
	align-items: center;
	gap: 6px;

	border-radius: 6px;

	font-weight: 600;
	white-space: nowrap;
}

.wrapper span {
	opacity: 0.5;
}

/**
 * Sizes
 */
.wrapper.small {
	height: 26px;
	font-size: 12px;
	line-height: 12px;

	padding: 0 8px;
}
.wrapper.medium {
	height: 30px;
	font-size: 13px;

	padding: 0 10px;
}

/**
 * Colors
 */

.wrapper.green {
	color: var(--text-secondary);
	fill: var(--green);
	background: rgba(255, 255, 255, 0.05);
}

.wrapper.yellow {
	color: var(--text-secondary);
	fill: var(--yellow);
	background: rgba(255, 255, 255, 0.05);
}

.wrapper.red {
	color: var(--text-secondary);
	fill: var(--red);
	background: rgba(255, 255, 255, 0.05);
}

.wrapper.gray {
	color: var(--text-secondary);
	fill: var(--text-secondary);
	background: rgba(255, 255, 255, 0.05);
}

.wrapper.orange {
	color: var(--text-secondary);
	fill: var(--orange);
	background: rgba(255, 255, 255, 0.05);
}

.wrapper.purple {
	color: var(--text-secondary);
	fill: var(--purple);
	background: rgba(255, 255, 255, 0.05);
}
</style>
