<script setup>
/**
 * Vendor
 */
import { ref, onMounted, onBeforeUnmount } from "vue"

const emit = defineEmits(["toggle"])
const props = defineProps({
	width: {
		type: [String, Number],
		default: 140,
	},
	label: {
		type: String,
	},
})

const triggerEl = ref(null)

const handleFocus = () => {
	triggerEl.value.children[0].addEventListener("keydown", handleEnterKey)
}

const handleBlur = () => {
	triggerEl.value.children[0].removeEventListener("keydown", handleEnterKey)
}

const handleEnterKey = (e) => {
	if (e.key !== "Enter") return

	emit("toggle")
}

onMounted(() => {
	if (!triggerEl.value) return

	triggerEl.value.children[0].addEventListener("focus", handleFocus)
	triggerEl.value.children[0].addEventListener("blur", handleBlur)
})

onBeforeUnmount(() => {
	if (!triggerEl.value) return

	triggerEl.value.children[0].removeEventListener("focus", handleFocus)
	triggerEl.value.children[0].removeEventListener("blur", handleBlur)
})
</script>

<template>
	<div ref="triggerEl">
		<Flex
			align="center"
			justify="between"
			:class="$style.wrapper"
			:style="{ width: `${width}px` }"
			tabindex="1"
		>
			<Text size="13" weight="600" color="primary" height="11">
				{{ label }}
			</Text>

			<Icon name="arrow" size="12" color="secondary" />
		</Flex>
	</div>
</template>

<style module>
.wrapper {
	height: 32px;

	border: 2px solid var(--border);
	border-radius: 8px;
	cursor: pointer;

	padding: 0 10px;

	transition: all 0.2s ease;
}

.wrapper:hover {
	/* border: 2px solid var(--border-highlight); */
	background: rgba(255, 255, 255, 0.05);
}

.wrapper:active {
	border: 2px solid var(--border-highlight);
}

.wrapper:focus {
	outline: none;
	box-shadow: rgb(75 135 244 / 15%) 0px 0px 0px 4px;
	border: 2px solid rgba(75, 135, 244, 0.8);
}
</style>
