<script setup>
import { useCssModule } from "vue"

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
</script>

<template>
	<button :class="[...getStyles(), loading && $style.loading]">
		<slot v-if="!icon" />
		<Icon v-else :name="icon" size="16" />
	</button>
</template>

<style module>
.wrapper {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10px;

	border-radius: 7px;

	color: var(--text-primary);
	font-weight: 600;
	white-space: nowrap;

	transition: all 0.2s ease;
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
	padding: 0 12px;
	font-size: 14px;
}
.wrapper.medium.icon {
	padding: 0 12px;
}

.wrapper.small {
	height: 32px;
	padding: 0 12px 0 12px;
	font-size: 13px;
	border-radius: 8px;
}
.wrapper.small.icon {
	padding: 0 10px;
}

.wrapper.mini {
	height: 26px;
	padding: 0 10px 0 10px;
	font-size: 12px;
	border-radius: 6px;
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
}

.wrapper.primary {
	background: var(--btn-primary-bg);
	fill: var(--text-primary);
}
.wrapper.primary:hover {
	background: var(--btn-primary-bg-hover);
}

.wrapper.white {
	background: var(--btn-white-bg);
	fill: var(--text-black);
	color: var(--text-black);
}
.wrapper.white:hover {
	background: var(--btn-white-bg-hover);
}

.wrapper.secondary {
	background: var(--opacity-05);
	fill: var(--text-secondary);
}
.wrapper.secondary:hover {
	background: var(--opacity-10);
}

.wrapper.tertiary {
	background: transparent;
	fill: var(--text-tertiary);
}
.wrapper.tertiary:hover {
	background: var(--btn-secondary-bg-hover);
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
