<script>
import icons from "./icons.json"

export default {
	name: "Icon",
	props: {
		name: { type: String, required: true },
		size: String,
		color: String,
	},
	computed: {
		calcSize() {
			return {
				minWidth: `${this.size}px`,
				minHeight: `${this.size}px`,
			}
		},
	},
	methods: {
		getPath() {
			return icons[this.name.charAt(0).toLowerCase() + this.name.slice(1)]
		},
		isSplitted() {
			return (
				typeof icons[
					this.name.charAt(0).toLowerCase() + this.name.slice(1)
				] == "object"
			)
		},
	},
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
