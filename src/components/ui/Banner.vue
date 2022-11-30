<script setup>
/**
 * UI
 */
import Spin from "@ui/Spin.vue"

defineProps({
	icon: { type: String, default: "warning" },
	color: { type: String, default: "yellow" },
	size: { type: String, default: "small" },
	center: { type: Boolean, default: false },
	loading: Boolean,
})
</script>

<template>
	<Flex
		align="center"
		gap="8"
		:class="[
			$style.wrapper,
			$style[color],
			$style[size],
			center && $style.center,
		]"
	>
		<Spin v-if="loading" size="14" />
		<Icon v-else :name="icon" size="14" />

		<Flex align="center" gap="8" :class="$style.base"><slot /></Flex>
	</Flex>
</template>

<style module>
.wrapper {
	width: 100%;
	min-height: 40px;

	border-radius: 8px;

	padding: 0 14px;
}

.base {
	font-size: 12px;
	line-height: 1.6;
	font-weight: 600;
}

.base span {
	font-weight: 800;
}

.wrapper.gray {
	fill: var(--text-secondary);
	color: var(--text-secondary);
	background: var(--opacity-05);
}

.wrapper.yellow {
	fill: var(--yellow);
	color: var(--yellow);
	background: rgba(245, 183, 43, 0.15);
}

.wrapper.green {
	fill: var(--green);
	color: var(--green);
	background: rgba(26, 161, 104, 0.15);
}

.wrapper.red {
	fill: var(--red);
	color: var(--red);
	background: rgba(224, 92, 67, 0.15);
}

.wrapper.medium {
	min-height: 40px;
}

.wrapper.medium .base {
	font-size: 13px;
}

.wrapper.small {
	padding: 0 10px;

	min-height: 30px;
	border-radius: 6px;
}

.wrapper.center {
	justify-content: center;
}
</style>
