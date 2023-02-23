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

	border-radius: 5px;

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
	background: linear-gradient(
		rgba(26, 161, 104, 0.06),
		rgba(26, 161, 104, 0.16)
	);

	box-shadow: 0 0 0 2px rgba(26, 161, 104, 0.4);
}

.wrapper.yellow {
	color: var(--text-secondary);
	fill: var(--yellow);
	background: linear-gradient(
		rgba(245, 183, 43, 0.04),
		rgba(245, 183, 43, 0.16)
	);

	box-shadow: 0 0 0 2px rgba(245, 183, 43, 0.2);
}

.wrapper.red {
	color: var(--text-secondary);
	fill: var(--red);
	background: rgba(255, 255, 255, 0.05);

	box-shadow: 0 0 0 2px rgba(224, 92, 67, 0.5);
}

.wrapper.gray {
	color: var(--text-secondary);
	fill: var(--text-secondary);
	background: linear-gradient(
		rgba(255, 255, 255, 0.04),
		rgba(255, 255, 255, 0.1)
	);

	box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
}

.wrapper.orange {
	color: var(--text-secondary);
	fill: var(--orange);
	background: rgba(239, 132, 86, 0.08);

	box-shadow: 0 0 0 2px rgba(239, 132, 86, 0.3);
}

.wrapper.purple {
	color: var(--text-secondary);
	fill: var(--purple);
	background: linear-gradient(
		rgba(133, 90, 209, 0.04),
		rgba(133, 90, 209, 0.16)
	);

	box-shadow: 0 0 0 2px rgba(133, 90, 209, 0.3);
}
</style>
