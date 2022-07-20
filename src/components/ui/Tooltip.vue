<script setup>
import { reactive, onMounted, ref } from "vue"

/**
 * UI
 */
import Button from "@/components/ui/Button"

const props = defineProps({
	placement: { type: String, default: "bottom" },
	textAlign: { type: String, default: "center" },
	isWide: { type: Boolean, default: null },
	button: { type: Object, default: null },
})

const trigger = ref(null)
const tip = ref(null)

const styles = reactive({
	left: "initial",
	right: "initial",
	top: "initial",
	bottom: "initial",
})

onMounted(() => {
	updateStyles()
})

const updateStyles = () => {
	const tipRect = tip.value.getBoundingClientRect()
	const triggerRect = trigger.value.getBoundingClientRect()

	/** top, top-start, top-end */
	/** bottom, bottom-start, bottom-end */
	/** left, left-start, left-end */
	/** right, right-start, right-end */

	const [position, side] = props.placement.split("-")

	switch (position) {
		case "top":
			styles.bottom = `${triggerRect.height + 8}px`
			break

		case "bottom":
			styles.top = `${triggerRect.height + 8}px`
			break

		case "left":
			styles.right = `${triggerRect.width + 8}px`
			break

		case "right":
			styles.left = `${triggerRect.width + 8}px`
			break

		default:
			break
	}

	if (["top", "bottom"].includes(position)) {
		if (side === "start") {
			styles.left = 0
		} else if (side === "end") {
			styles.right = 0
		} else {
			styles.left = `-${tipRect.width / 2 - triggerRect.width / 2}px`
		}
	} else if (["left", "right"].includes(position)) {
		if (side === "start") {
			styles.top = 0
		} else if (side === "end") {
			styles.bottom = 0
		} else {
			styles.top = `${triggerRect.height / 2 - tipRect.height / 2}px`
		}
	}
}
</script>

<template>
	<div :class="$style.wrapper" :style="{ width: isWide && '100%' }">
		<div
			ref="trigger"
			:class="$style.trigger"
			:style="{ width: isWide && '100%' }"
		>
			<slot />
		</div>

		<div ref="tip" :class="[$style.content]" :style="styles">
			<div :class="[$style.text]" :style="{ textAlign }">
				<slot name="content" />
			</div>

			<router-link v-if="button" :to="button.url">
				<Button type="secondary" size="mini" :class="$style.btn" block
					><Icon :name="button.icon" size="12" />{{
						button.text
					}}</Button
				>
			</router-link>
		</div>
	</div>
</template>

<style module>
.wrapper {
	display: flex;
	position: relative;
	width: fit-content;
}

.trigger {
	display: flex;
}

.content {
	z-index: 1000;
	width: max-content;
	visibility: hidden;
	opacity: 0;
	position: absolute;
	transform: scale(0.95);
	padding: 8px 10px;
	box-sizing: border-box;
	background-color: rgba(0, 0, 0, 0.6);
	border-radius: 8px;
	backdrop-filter: blur(5px);

	transition: all 0.15s ease;
}

.wrapper:hover .content {
	visibility: visible;
	opacity: 1;
	transform: scale(1);
}

.text {
	font-size: 12px;
	font-weight: 600;
	color: var(--text-primary);
}

.text span {
	font-weight: 500;
	color: var(--text-secondary);
}

.btn {
	margin: 8px 0 2px 0;
}
</style>
