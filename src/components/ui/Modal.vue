<script setup>
/**
 * Vendor
 */
import {
	nextTick,
	onBeforeMount,
	onBeforeUnmount,
	computed,
	ref,
	watch,
} from "vue"
import * as focusTrap from "focus-trap"

/**
 * Composable
 */
import { useOnOutsidePress } from "@/composable/onOutside"

const emit = defineEmits(["onClose"])
const props = defineProps({
	new: {
		type: Boolean,
		default: false,
	},

	show: {
		type: Boolean,
	},
	width: {
		type: String,
	},
	closable: {
		type: Boolean,
	},

	/** Closes only after the action */
	required: {
		type: Boolean,
	},
	zIndex: {
		type: String,
		default: "1001",
	},
	blockClosing: {
		type: Boolean,
		default: false,
	},
	disableTrap: {
		type: Boolean,
		default: false,
	},

	closeOutside: {
		type: Boolean,
		default: true,
	},
})

let removeOutside
const modal = ref(null)
const trap = ref({})

watch(
	() => props.show,
	() => {
		if (!props.show) {
			if (!props.disableTrap) trap.value.deactivate()

			if (removeOutside) {
				removeOutside()
			}
		} else {
			nextTick(() => {
				if (!props.disableTrap) {
					trap.value = focusTrap.createFocusTrap(modal.value)
					trap.value.activate()
				}

				if (!props.closeOutside) return
				removeOutside = useOnOutsidePress(modal, () => {
					if (props.blockClosing) return
					handleClose()
				})
			})
		}
	},
)

onBeforeMount(() => {
	document.addEventListener("keydown", onKeydown)
})

onBeforeUnmount(() => {
	document.removeEventListener("keydown", onKeydown)
})

const calcModalStyles = computed(() => {
	const styles = {
		width: props.width ? `${props.width}px` : `400px`,
	}

	props.new && (styles.padding = "0")

	return styles
})

const showShakeAnimation = ref(false)
const handleClose = (e) => {
	if (e && e.path.find((el) => el.id === "dropdown")) {
		return
	} else {
		/** prevent closing */
		if (props.blockClosing) return
		if (props.required) {
			showShakeAnimation.value = true
			setTimeout(() => {
				showShakeAnimation.value = false
			}, 700)
			return
		}

		emit("onClose")
	}
}

const onKeydown = (event) => {
	if (event.key == "Escape" && props.show) handleClose()
}
</script>

<template>
	<teleport to="#modal">
		<transition name="popup">
			<Flex
				v-if="show"
				align="center"
				justify="center"
				:class="$style.wrapper"
				:style="{ zIndex: zIndex }"
			>
				<div
					ref="modal"
					:class="[$style.modal, showShakeAnimation && $style.shake]"
					:style="calcModalStyles"
				>
					<slot />

					<Icon
						v-if="closable && !props.new"
						name="close"
						size="16"
						@click="handleClose"
						:class="$style.close_icon"
					/>
				</div>
			</Flex>
		</transition>
	</teleport>
</template>

<style module>
.wrapper {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;

	overflow: hidden;

	backdrop-filter: blur(2px);
	background: rgba(0, 0, 0, 0.2);

	transition: all 0.2s ease;
}

.modal {
	position: relative;
	overflow: hidden;

	border-radius: 8px;
	background: var(--modal-bg);
	box-shadow: rgb(0 0 0 / 20%) 0px 0px 1px, rgb(0 0 0 / 30%) 0px 10px 40px;

	padding: 32px;
	margin: 0 20px;
}

.modal.shake {
	animation: shake 0.4s;
}

@keyframes shake {
	0% {
		transform: translatex(8px) scale(1.03);
	}

	20% {
		transform: translatex(-6px) scale(1.02);
	}

	40% {
		transform: translatex(4px) scale(1.01);
	}

	60% {
		transform: translatex(-2px);
	}

	80% {
		transform: translatex(0);
	}

	100% {
		transform: translateY(0);
	}
}

.close_icon {
	position: absolute;
	top: 32px;
	right: 32px;

	fill: var(--icon);
	background: transparent;
	box-sizing: content-box;
	border-radius: 5px;
	padding: 4px;

	transition: fill 0.2s ease, background 0.2s ease;
}

.close_icon:hover {
	background: rgba(255, 255, 255, 0.1);
}
</style>
