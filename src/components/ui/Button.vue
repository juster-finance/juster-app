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
const pressed = ref({})

const handleKeyDown = (e) => {
	const eventKey = e.key.toLowerCase()
	const keybind = props.keybind.toLowerCase()

	if (pressed.value[eventKey]) return

	if (eventKey === keybind) pressed.value[eventKey] = true

	if (keybind.split("+").length) {
		const hotkeys = keybind.split("+")
		if (hotkeys.includes(eventKey)) pressed.value[eventKey] = true
	}
}

const handleKeyUp = (e) => {
	const eventKey = e.key.toLowerCase()
	const keybind = props.keybind.toLowerCase()

	if (!pressed.value[eventKey]) return

	if (eventKey === keybind) {
		pressed.value[eventKey] = false
		emit("onKeybind")
	}

	if (keybind.split("+").length) {
		const hotkeys = keybind.split("+")

		if (hotkeys.every((k) => pressed.value[k])) emit("onKeybind")

		if (hotkeys.includes(eventKey)) pressed.value[eventKey] = false
	}
}

onMounted(() => {
	if (props.keybind) {
		document.addEventListener("keydown", handleKeyDown)
		document.addEventListener("keyup", handleKeyUp)

		if (props.keybind.split("+").length) {
			props.keybind.split("+").forEach((k) => {
				pressed.value[k.toLowerCase()] = false
			})
		} else {
			pressed.value[props.keybind.toLowerCase()] = false
		}
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
	<button v-if="!link" :class="[...getStyles(), loading && $style.loading]">
		<slot v-if="!icon" />
		<Icon v-else :name="icon" size="16" />

		<Flex
			v-if="keybind"
			align="center"
			gap="4"
			:class="[
				$style.keybinds,
				pressed[keybind.split('+')[0].toLowerCase()] && $style.pressed,
			]"
		>
			<div
				v-if="keybind && keybind.split('+').length < 2"
				ref="hotkey"
				:class="[
					$style.keybind,
					pressed[keybind.toLowerCase()] && $style.pressed,
				]"
			>
				{{ keybind }}
			</div>

			<div
				v-else
				v-for="hotkey in keybind.split('+')"
				:class="[
					$style.keybind,
					pressed[hotkey.toLowerCase()] && $style.pressed,
				]"
			>
				{{ hotkey }}
			</div>
		</Flex>
	</button>

	<a
		v-else
		:href="link"
		target="_blank"
		:class="[...getStyles(), $style.link, loading && $style.loading]"
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

.wrapper.white:focus {
	box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
}

.keybinds {
	position: absolute;
	right: 12px;

	opacity: 0.5;

	transition: opacity 0.2s ease;
}

.keybinds.pressed {
	opacity: 1;
}

.keybind {
	font-size: 12px;
	font-weight: 700;
	padding: 3px 6px;
	color: var(--text-secondary);

	border-radius: 4px;

	transition: all 0.2s ease;
}

.wrapper.primary .keybind {
	background: linear-gradient(
		rgba(255, 255, 255, 0.2),
		rgba(255, 255, 255, 0.1)
	);

	box-shadow: 0px 2px 0 0px rgba(255, 255, 255, 0.2);
}

.wrapper.secondary .keybind {
	background: linear-gradient(
		rgba(255, 255, 255, 0.1),
		rgba(255, 255, 255, 0.05)
	);

	box-shadow: 0 2px 0 0px rgba(0, 0, 0, 0.3);
}

.keybind.pressed {
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
	gap: 8px;
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

.wrapper.error {
	background: var(--btn-error-bg);
	fill: var(--text-black);
	color: var(--text-black);
}
.wrapper.error:hover {
	background: var(--btn-error-bg-hover);
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

.wrapper.text {
	height: initial;

	color: var(--text-blue);

	background: transparent;

	padding: 0;

	transition: color 0.2s ease;
}

.wrapper.text:hover {
	color: var(--blue);
}

.wrapper.text.small {
	font-size: 12px;
	line-height: 1;
}

/** OTHER */
.wrapper.disabled {
	opacity: 0.5;
	pointer-events: none;
}

.wrapper.border {
	border: 1px solid var(--border);
}

.link {
	outline: none;
}
</style>
