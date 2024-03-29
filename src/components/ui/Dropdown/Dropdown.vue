<script setup>
/**
 * Vendor
 */
import { ref, watch, nextTick } from "vue"
import * as focusTrap from "focus-trap"

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
	disableAutofocus: {
		type: Boolean,
		default: false,
	},
})

const emit = defineEmits(["onClose"])

const trigger = ref(null)
const dropdown = ref(null)
const isOpen = ref(false)
const trap = ref({})

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
	const path = e.path ? e.path : e.composedPath()
	if (path.find((el) => el.id === "trigger")) {
		return
	} else {
		close()
	}
}

watch(isOpen, () => {
	if (!isOpen.value) {
		trap.value.deactivate()
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
			/**
			 * Autofocus first item & activate focus-trap
			 */
			trap.value = focusTrap.createFocusTrap(dropdown.value.$el, {
				initialFocus: !props.disableAutofocus,
			})
			trap.value.activate()

			if (!props.disableAutofocus) {
				let focused = false
				for (
					let index = 0;
					index < dropdown.value.$el.children.length;
					index++
				) {
					const child = dropdown.value.$el.children[index]

					/** check as a string because of data-set specifics */
					if (child.dataset.active === "true") {
						child.focus()
						focused = true
					}
				}
				if (!focused) dropdown.value.$el.children[0].focus()
			}

			/** Check if there is enough space to open (top/bottom) */
			const dropdownRect = dropdown.value.$el.getBoundingClientRect()

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
						<Flex
							ref="dropdown"
							@click="close"
							:class="$style.dropdown"
							:style="{
								...dropdownStyles,
							}"
							direction="column"
							gap="4"
						>
							<slot name="dropdown" />
						</Flex>
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
	background: rgba(38, 38, 42, 1);
	box-shadow: rgb(0 0 0 / 20%) 0px 4px 24px;
	border: 1px solid var(--border);
}
</style>
