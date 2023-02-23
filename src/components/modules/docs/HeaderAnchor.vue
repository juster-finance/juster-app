<script setup>
import { useSlots, computed } from "vue"

defineProps({
	h: {
		type: String,
		default: "2",
	},
})

const slots = useSlots()

const generatedHref = computed(() => {
	const text = slots.default()[0].children

	return text
		.toString()
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/[^\w\-]+/g, "")
		.replace(/\-\-+/g, "-")
		.replace(/^-+/, "")
		.replace(/-+$/, "")
})
</script>

<template>
	<component :is="`h${h}`" :class="$style.wrapper">
		<a :href="`#${generatedHref}`" rel="noopener nofollow noreferrer">
			<slot />
			<Icon name="anchor" size="16" :class="$style.anchor_icon" />
		</a>
		<div :id="generatedHref" :class="$style.anchor" />
	</component>
</template>

<style module>
.wrapper a {
	display: flex;
	align-items: center;
	gap: 8px;

	transition: all 0.2s ease;
}

.wrapper a:focus-visible {
	transform: translateY(-2px);
}

.wrapper a:focus-visible .anchor_icon {
	opacity: 1;
}

.anchor {
	display: block;
	position: relative;
	top: -154px;
	visibility: hidden;
}

.anchor_icon {
	opacity: 0;
	fill: var(--text-tertiary);

	transition: all 0.1s ease;
}
.wrapper:hover .anchor_icon {
	opacity: 1;
}
</style>
