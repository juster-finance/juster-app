<script setup>
import { ref, watch, nextTick } from "vue"

/**
 * Composable
 */
import { useOnOutsidePress } from "@/composable/onOutside"

const props = defineProps({
	forceOpen: Boolean,
	side: {
		type: String,
		default: "bottom",
	},
	width: {
		type: String,
		default: null,
	},
})

const emit = defineEmits(["onClose"])

const trigger = ref(null)
const dropdown = ref(null)
const isOpen = ref(false)

watch(
	() => props.forceOpen,
	() => {
		isOpen.value = props.forceOpen
	},
)

const toggleDropdown = (event) => {
	event.stopPropagation()

	isOpen.value = !isOpen.value
}
const close = (event) => {
	if (event) event.stopPropagation()

	isOpen.value = false

	emit("onClose")
}

const dropdownStyles = ref({})

let removeOutside
const handleOutside = (e) => {
	if (e.path.find((el) => el.id === "trigger")) {
		return
	} else {
		close()
	}
}

watch(isOpen, () => {
	if (!isOpen.value) {
		removeOutside()

		if (Object.prototype.hasOwnProperty.call(dropdownStyles.value, "top")) {
			delete dropdownStyles.value.top
		}
		if (
			Object.prototype.hasOwnProperty.call(dropdownStyles.value, "bottom")
		) {
			delete dropdownStyles.value.bottom
		}

		document.removeEventListener("keydown", onKeydown)
	} else {
		document.addEventListener("keydown", onKeydown)

		const triggerRect = trigger.value.getBoundingClientRect()

		if (props.width) {
			dropdownStyles.value.width = `${props.width}px`
		}

		dropdownStyles.value.right = `${
			window.innerWidth - triggerRect.x - triggerRect.width
		}px`

		nextTick(() => {
			/** Check if there is enough space to open (top/bottom) */
			const dropdownRect = dropdown.value.getBoundingClientRect()

			if (props.side === "bottom") {
				if (
					window.innerHeight - dropdownRect.height - triggerRect.top <
					50
				) {
					dropdownStyles.value.bottom = `${
						window.innerHeight - triggerRect.y + 6
					}px`
				} else {
					dropdownStyles.value.top = `${
						triggerRect.y + triggerRect.height + 6
					}px`
				}
			}

			if (props.side == "top") {
				if (triggerRect.top < dropdownRect.height) {
					dropdownStyles.value.top = `${
						triggerRect.y + triggerRect.height + 6
					}px`
				} else {
					dropdownStyles.value.bottom = `${
						window.innerHeight - triggerRect.y + 6
					}px`
				}
			}

			removeOutside = useOnOutsidePress(dropdown, handleOutside)
		})
	}
})

const onKeydown = (event) => {
	if (event.key == "Escape") close()
}
</script>

<template>
	<div :class="$style.wrapper">
		<div
			ref="trigger"
			id="trigger"
			@click="toggleDropdown"
			:class="$style.trigger"
		>
			<slot name="trigger" />
		</div>

		<teleport to="#dropdown">
			<transition name="fastfade">
				<div v-if="isOpen" :class="$style.canvas">
					<transition name="dropdown" appear>
						<div
							ref="dropdown"
							@click="close"
							:class="$style.dropdown"
							:style="{
								...dropdownStyles,
							}"
						>
							<slot name="dropdown" />
						</div>
					</transition>
				</div>
			</transition>
		</teleport>
	</div>
</template>

<style module>
.wrapper {
	position: relative;
}

.trigger {
	cursor: pointer;
}

.canvas {
	position: fixed;
	inset: 0;
	z-index: 2000;
}

.dropdown {
	position: absolute;

	padding: 8px 0;
	border-radius: 8px;
	background: rgba(39, 39, 42, 0.5);
	box-shadow: rgb(0 0 0 / 20%) 0px 4px 24px;
	backdrop-filter: blur(10px) saturate(190%) contrast(70%) brightness(80%);
	border: 1px solid rgb(60, 63, 68);
}
</style>
