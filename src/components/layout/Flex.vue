<script setup>
import { computed } from "vue"
/* eslint-disable vue/require-default-prop */

const props = defineProps({
	align: {
		type: String,
	},
	justify: {
		type: String,
	},
	wrap: {
		type: String,
	},
	direction: {
		type: String,
	},
	gap: {
		type: String,
	},
	wide: {
		type: Boolean,
		default: false,
	},
	inline: {
		type: Boolean,
		default: false,
	},
})

const classes = computed(() => {
	const flexClasses = ["flex"]

	if (props.align) {
		flexClasses.push(`f-ai--${props.align}`)
	}
	if (props.justify) {
		flexClasses.push(`f-jc--${props.justify}`)
	}
	if (props.wrap) {
		flexClasses.push(`f-w--${props.wrap}`)
	}
	if (props.direction) {
		flexClasses.push(`f-d--${props.direction}`)
	}
	if (props.gap) {
		flexClasses.push(`gap--${props.gap}`)
	}
	if (props.wide) {
		flexClasses.push("f--wide")
	}
	if (props.inline) {
		flexClasses.push("f--inline")
	}

	return flexClasses
})
</script>

<template>
	<div :class="classes">
		<slot />
	</div>
</template>
