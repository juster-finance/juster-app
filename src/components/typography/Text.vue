<script setup>
import { computed } from "vue"
/* eslint-disable vue/require-default-prop */

const props = defineProps({
	size: {
		type: String,
	},
	weight: {
		type: String,
	},
	height: {
		type: String,
		default: "10",
	},
	align: {
		type: String,
	},
	color: {
		type: String,
	},
	noWrap: {
		type: Boolean,
	},
})

const classes = computed(() => {
	const flexClasses = []

	if (props.size) {
		flexClasses.push(`fz--${props.size}`)
	}
	if (props.weight) {
		flexClasses.push(`fw--${props.weight}`)
	}
	if (props.height) {
		flexClasses.push(`lh--${props.height}`)
	}
	if (props.align) {
		flexClasses.push(`ta--${props.align}`)
	}
	if (props.color) {
		flexClasses.push(`color--${props.color}`)
	}
	if (props.noWrap) {
		flexClasses.push(`no-wrap`)
	}

	return flexClasses
})
</script>

<template>
	<span :class="classes">
		<slot />
	</span>
</template>
