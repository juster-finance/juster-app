<script setup>
import { computed } from "vue"
import icons from "./icons.json"

const props = defineProps({
	name: { type: String, required: true, default: "warning" },
	size: { type: String, default: "16" },
})

const calcSize = computed(() => {
	return {
		minWidth: `${props.size}px`,
		minHeight: `${props.size}px`,
	}
})

const getPath = () => {
	return icons[props.name.charAt(0).toLowerCase() + props.name.slice(1)]
}

const isSplitted = () => {
	return (
		typeof icons[
			props.name.charAt(0).toLowerCase() + props.name.slice(1)
		] == "object"
	)
}
</script>

<template>
	<svg
		viewBox="0 0 24 24"
		:width="size"
		:height="size"
		:style="calcSize"
		role="img"
	>
		<path v-if="!isSplitted(name)" :d="getPath(name)" />
		<template v-else>
			<path
				v-for="path in getPath(name)"
				:key="path.id"
				:d="path.path"
				:style="{ opacity: path.opacity }"
			/>
		</template>
	</svg>
</template>
