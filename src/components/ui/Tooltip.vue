<script setup>
import { reactive, onMounted, ref } from "vue"

/**
 * UI
 */
import Button from "@ui/Button.vue"

const props = defineProps({
	placement: { type: String, default: "bottom" },
	textAlign: { type: String, default: "center" },
	isWide: { type: Boolean, default: null },
	button: { type: Object, default: null },
	disabled: { type: Boolean, default: false },
})

const trigger = ref(null)
const tip = ref(null)

const carretPosition = reactive({
	left: null,
	right: null,
	top: null,
	bottom: null,
	rotate: 0,
})

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
			styles.bottom = `${triggerRect.height + 12}px`
			carretPosition.bottom = -8
			carretPosition.rotate = 180
			break

		case "bottom":
			styles.top = `${triggerRect.height + 12}px`
			carretPosition.top = -8
			break

		case "left":
			styles.right = `${triggerRect.width + 12}px`
			carretPosition.right = -11.5
			carretPosition.rotate = 90
			break

		case "right":
			styles.left = `${triggerRect.width + 12}px`
			carretPosition.left = -11.5
			carretPosition.rotate = -90
			break

		default:
			break
	}

	if (["top", "bottom"].includes(position)) {
		if (side === "start") {
			styles.left = `-8px`
			carretPosition.left = triggerRect.width / 2
		} else if (side === "end") {
			styles.right = `-8px`
			carretPosition.right = triggerRect.width / 2
		} else {
			styles.left = `${triggerRect.width / 2 - tipRect.width / 2}px`
			carretPosition.left = tipRect.width / 2 - 8
		}
	} else if (["left", "right"].includes(position)) {
		if (side === "start") {
			styles.top = `-8px`
			carretPosition.top = triggerRect.height / 2 + 4
		} else if (side === "end") {
			styles.bottom = `-8px`
			carretPosition.bottom = triggerRect.height / 2 + 4
		} else {
			styles.top = `${triggerRect.height / 2 - tipRect.height / 2}px`
			carretPosition.top = tipRect.height / 2 - 4
		}
	}
}
</script>

<template>
	<div :class="$style.wrapper" :style="{ width: isWide && '100%' }">
		<div
			ref="trigger"
			@mouseenter="updateStyles()"
			:class="$style.trigger"
			:style="{ width: isWide && '100%' }"
		>
			<slot />
		</div>

		<div
			@click.stop
			ref="tip"
			:class="[$style.content, disabled ? $style.disabled : $style.show]"
			:style="styles"
		>
			<svg
				width="16"
				height="8"
				viewBox="0 0 16 8"
				xmlns="http://www.w3.org/2000/svg"
				:class="$style.carret"
				:style="{
					left: `${carretPosition.left}px`,
					right: `${carretPosition.right}px`,
					top: `${carretPosition.top}px`,
					bottom: `${carretPosition.bottom}px`,
					transform: `rotate(${carretPosition.rotate}deg)`,
				}"
			>
				<path
					fill-rule="evenodd"
					clip-rule="evenodd"
					d="M15 8H1L6.14373 2.78025C7.16892 1.73991 8.83108 1.73992 9.85627 2.78025L15 8Z"
				/>
			</svg>

			<div :class="[$style.text]" :style="{ textAlign }">
				<slot name="content" />
			</div>

			<router-link v-if="button" :to="button.url">
				<Button
					:type="button.type"
					size="mini"
					:class="$style.btn"
					block
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

	transition: all 0.15s var(--bezier);
}

.carret {
	position: absolute;

	fill: rgba(0, 0, 0, 0.6) !important;
}

.wrapper:hover .content.show {
	visibility: visible;
	opacity: 1;
	transform: scale(1);
}

.wrapper:hover .content.disabled {
	visibility: hidden;
	opacity: 0;
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
