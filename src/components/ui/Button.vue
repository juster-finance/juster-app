<script setup>
/**
 * Vendor
 */
import { ref, onMounted, onBeforeUnmount, useCssModule } from "vue"

const emit = defineEmits(["onKeybind"])
const props = defineProps({
	size: {
		type: String,
		default: "medium",
	},
	type: {
		type: String,
		default: "primary",
	},
	block: {
		type: Boolean,
		default: false,
	},
	border: {
		type: Boolean,
		default: false,
	},
	disabled: {
		type: Boolean,
	},
	loading: {
		type: Boolean,
	},
	icon: {
		type: String,
	},
	asLink: {
		type: Boolean,
		default: false,
	},
	link: {
		type: String,
	},
	keybind: {
		type: String,
	},
})

const style = useCssModule()

const getStyles = () => {
	const hasCorrectSize = ["large", "medium", "small", "mini"].includes(
		props.size,
	)

	return [
		style.wrapper,
		style[props.type],
		props.block && style.block,
		hasCorrectSize && style[props.size],
		props.disabled && style.disabled,
		props.icon && style.icon,
		props.border && style.border,
	]
}

/**
 * Keybind Animation
 */

const hotkey = ref(null)
const pressed = ref(false)

const handleKeyDown = (e) => {
	if (pressed.value) {
		return
	} else if (e.key.toLowerCase() === props.keybind.toLowerCase()) {
		pressed.value = true
	}
}

const handleKeyUp = (e) => {
	if (!pressed.value) {
		return
	} else if (e.key.toLowerCase() === props.keybind.toLowerCase()) {
		pressed.value = false
		emit("onKeybind")
	}
}

onMounted((el, binding, vnode) => {
	if (props.keybind) {
		document.addEventListener("keydown", handleKeyDown)
		document.addEventListener("keyup", handleKeyUp)
	}
})
onBeforeUnmount(() => {
	if (props.keybind) {
		document.removeEventListener("keydown", handleKeyDown)
		document.addEventListener("keyup", handleKeyUp)
	}
})
</script>

<template>
	<button v-if="!asLink" :class="[...getStyles(), loading && $style.loading]">
		<slot v-if="!icon" />
		<Icon v-else :name="icon" size="16" />

		<div
			v-if="keybind"
			ref="hotkey"
			:class="[$style.hotkey, pressed && $style.pressed]"
		>
			{{ keybind }}
		</div>
	</button>

	<a
		v-else
		:href="link"
		target="_blank"
		:class="[...getStyles(), loading && $style.loading]"
	>
		<slot v-if="!icon" />
		<Icon v-else :name="icon" size="16" />
	</a>
</template>

<style module>
.wrapper {
	position: relative;

	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10px;

	border-radius: 7px;
	cursor: pointer;
	outline: 1px solid transparent;

	color: var(--text-primary);
	font-weight: 600;
	white-space: nowrap;

	transition: all 0.2s ease;
}

.wrapper.primary:focus {
	box-shadow: 0 0 0 3px rgba(39, 110, 241, 0.4);
}

.wrapper.secondary:focus {
	box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
}

.hotkey {
	position: absolute;
	right: 12px;

	font-size: 12px;
	font-weight: 700;
	padding: 3px 6px;
	color: var(--text-secondary);

	border-radius: 4px;

	transition: all 0.2s ease;
}

.wrapper.primary .hotkey {
	background: linear-gradient(
		rgba(255, 255, 255, 0.2),
		rgba(255, 255, 255, 0.1)
	);

	box-shadow: 0px 2px 0 0px rgba(255, 255, 255, 0.2);
}

.wrapper.secondary .hotkey {
	background: linear-gradient(
		rgba(255, 255, 255, 0.1),
		rgba(255, 255, 255, 0.05)
	);

	box-shadow: 0 2px 0 0px rgba(0, 0, 0, 0.3);
}

.hotkey.pressed {
	transform: translateY(1px);
	box-shadow: 0 0 0 0 transparent !important;
}

.wrapper span {
	color: var(--text-tertiary);
}

.wrapper.loading {
	opacity: 0.5;
	pointer-events: none;
}

.wrapper.block {
	width: 100%;
	justify-content: center;
}

/** SIZES */
.wrapper.large {
	height: 44px;
	font-size: 14px;
	line-height: 1;
}
.wrapper.large.icon {
	padding: 0 14px;
}

.wrapper.medium {
	height: 36px;
	font-size: 14px;
	line-height: 1;
	gap: 8px;

	padding: 0 12px;
}
.wrapper.medium.icon {
	padding: 0 12px;
}

.wrapper.small {
	height: 32px;
	padding: 0 12px;
	font-size: 13px;
	border-radius: 6px;
}
.wrapper.small.icon {
	padding: 0 10px;
}

.wrapper.mini {
	gap: 8px;
	height: 26px;
	padding: 0 10px 0 10px;
	border-radius: 6px;

	font-size: 12px;
}
.wrapper.mini.icon {
	padding: 0 10px;
}

.wrapper:active {
	transform: translateY(1px);
}

/** TYPES */
.wrapper.success {
	background: var(--btn-success-bg);
	fill: var(--text-black);
	color: var(--text-black);
}
.wrapper.success:hover {
	background: var(--btn-success-bg-hover);
	box-shadow: 0 0 0 0 transparent;
}

.wrapper.primary {
	background: var(--btn-primary-bg);
	fill: var(--text-primary);
}
.wrapper.primary:hover {
	background: var(--btn-primary-bg-hover);
	box-shadow: 0 0 0 0 transparent;
}

.wrapper.white {
	background: var(--btn-white-bg);
	fill: var(--text-black);
	color: var(--text-black);
}
.wrapper.white:hover {
	background: var(--btn-white-bg-hover);
	box-shadow: 0 0 0 0 transparent;
}

.wrapper.secondary {
	background: var(--opacity-05);
	fill: var(--text-secondary);
}
.wrapper.secondary:hover {
	background: var(--opacity-10);
	box-shadow: 0 0 0 0 transparent;
}

.wrapper.tertiary {
	background: transparent;
	fill: var(--text-tertiary);
}
.wrapper.tertiary:hover {
	background: var(--btn-secondary-bg-hover);
	box-shadow: 0 0 0 0 transparent;
}

/** OTHER */
.wrapper.disabled {
	opacity: 0.5;
	pointer-events: none;
}

.wrapper.border {
	border: 1px solid var(--border);
}
</style>
