<script>
import { defineComponent, ref, watch, nextTick, toRefs } from "vue"

/**
 * Composable
 */
import { useOnOutsidePress } from "@/composable/onOutside"

export default defineComponent({
	name: "Dropdown",
	props: {
		forceOpen: Boolean,
		side: {
			type: String,
			default: "bottom",
		},
	},
	emits: ["onClose"],

	setup(props, context) {
		const { side, forceOpen } = toRefs(props)

		const trigger = ref(null)
		const dropdown = ref(null)
		const isOpen = ref(false)

		watch(forceOpen, () => {
			isOpen.value = forceOpen.value
		})

		const toggleDropdown = (event) => {
			event.stopPropagation()

			isOpen.value = !isOpen.value
		}
		const close = (event) => {
			if (event) event.stopPropagation()

			isOpen.value = false

			context.emit("onClose")
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

				dropdownStyles.value.right = `${
					window.innerWidth - triggerRect.x - triggerRect.width
				}px`

				if (side.value == "bottom") {
					dropdownStyles.value.top = `${
						triggerRect.y + triggerRect.height + 6
					}px`
				}
				if (side.value == "top") {
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

		return {
			trigger,
			dropdown,
			isOpen,
			toggleDropdown,
			close,
			dropdownStyles,
		}
	},
})
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
	box-shadow: rgb(0 0 0 / 20%) 0px 4px 24px;
}
</style>
