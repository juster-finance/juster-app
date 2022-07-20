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

		if (props.side == "bottom") {
			dropdownStyles.value.top = `${
				triggerRect.y + triggerRect.height + 6
			}px`
		}
		if (props.side == "top") {
			dropdownStyles.value.bottom = `${
				window.innerHeight - triggerRect.y + 6
			}px`
		}

		nextTick(() => {
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

<style>
.popup-enter-active,
.popup-leave-active {
	transition: all 0.07s ease-out;
}

.popup-enter-from,
.popup-leave-to {
	opacity: 0;
	transform: scale(0.95);
}
</style>

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
	background: var(--dropdown-bg);
	box-shadow: rgb(0 0 0 / 30%) 0px 20px 40px;
}
</style>
