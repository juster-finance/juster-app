<script setup>
/**
 * Vendor
 */
import { ref, watch, computed } from "vue"

const emit = defineEmits(["update:modelValue"])
const props = defineProps({
	type: {
		type: String,
	},
	label: {
		type: String,
	},
	hint: {
		type: String,
	},
	icon: {
		type: String,
	},
	cleanable: {
		type: Boolean,
	},
	subtext: {
		type: String,
	},
	placeholder: {
		type: String,
		required: true,
	},
	modelValue: {
		type: [String, Number],
	},
	disabled: {
		type: Boolean,
	},
	limit: {
		type: Number,
	},
})

const isFocused = ref(false)

const inputEl = ref(null)
const text = ref(props.modelValue ? props.modelValue : "")

watch(
	() => props.modelValue,
	() => {
		text.value = props.modelValue
	},
)

const getInputType = computed(() => {
	if (!!props.type) return props.type
	return "text"
})

const handleInput = () => {
	if (props.disabled) return

	if (props.type === "number") {
		emit(
			"update:modelValue",
			isNaN(parseFloat(text.value)) ? text.value : parseFloat(text.value),
		)
	} else {
		emit("update:modelValue", text.value)
	}

	if (parseFloat(text.value) > props.limit) {
		emit("update:modelValue", props.limit)
		text.value = props.limit
	}
}

const handleClear = () => {
	emit("update:modelValue", "")
}

const handleKeydown = (e) => {
	if (props.disabled && e.key !== "Tab") e.preventDefault()
	if (props.type == "number") {
		if (e.key === "-") e.preventDefault()
	}
}

const handleClick = () => {
	if (inputEl.value) inputEl.value.focus()
}

const handleFocus = () => {
	isFocused.value = true

	emit("clearError")
}

const handleBlur = () => {
	isFocused.value = false
}
</script>

<template>
	<Flex direction="column" gap="8">
		<Flex v-if="label" align="center" justify="between">
			<Text size="12" weight="600" color="primary">{{ label }}</Text>

			<slot name="rightText" />
		</Flex>

		<div
			ref="base"
			@click="handleClick"
			:class="[
				$style.base,
				isFocused && $style.focused,
				disabled && $style.disabled,
			]"
		>
			<Flex align="center" gap="4" wide>
				<Icon v-if="icon" :name="icon" size="16" color="tertiary" />
				<input
					ref="inputEl"
					:type="getInputType"
					v-model="text"
					@input="handleInput"
					@focus="handleFocus"
					@blur="handleBlur"
					@keydown="handleKeydown"
					:placeholder="placeholder"
				/>
			</Flex>

			<transition name="fade">
				<Icon
					v-if="cleanable && modelValue"
					@click="handleClear"
					name="close_circle"
					size="16"
					:class="$style.clean_btn"
				/>
			</transition>

			<div v-if="subtext" :class="$style.subtext">{{ subtext }}</div>
		</div>

		<Text v-if="hint" size="12" weight="600" color="support" height="14">
			{{ hint }}
		</Text>
	</Flex>
</template>

<style module>
.base {
	display: flex;
	align-items: center;
	justify-content: space-between;

	height: 42px;
	border-radius: 8px;
	border: 2px solid var(--border);
	background: var(--input-background);
	padding: 0 12px;
	cursor: text;

	transition: all 0.2s ease;
}

.base:hover {
	border: 2px solid var(--border-highlight);
}

.base.focused {
	box-shadow: rgb(75 135 244 / 15%) 0px 0px 0px 4px;
	border: 2px solid rgba(75, 135, 244, 0.8);
}

.base.disabled {
	opacity: 0.5;
	pointer-events: none;
}

.base input {
	border: none;
	outline: none;
	width: 100%;
	padding: 0;

	font-size: 14px;
	font-weight: 600;
	line-height: 1;
	color: var(--text-primary);
	margin-left: 2px;
}

.base input::placeholder {
	font-weight: 500;
}

.base input::-webkit-outer-spin-button,
.base input::-webkit-inner-spin-button {
	-webkit-appearance: none;
	margin: 0;
}

.subtext {
	font-size: 12px;
	font-weight: 700;
	color: var(--text-tertiary);
}

.clean_btn {
	fill: var(--text-tertiary);
	cursor: pointer;

	transition: fill 0.2s ease;
}

.clean_btn:hover {
	fill: var(--text-secondary);
}
</style>
