<script setup>
defineProps({ disabled: { type: Boolean } })
</script>

<template>
	<div :class="[$style.wrapper, disabled && $style.disabled]" tabindex="1">
		<slot />
	</div>
</template>

<style module>
.wrapper {
	display: flex;
	align-items: center;

	min-width: 120px;
	height: 32px;
	padding: 0 16px 0 8px;
	margin: 0 8px;
	border-radius: 6px;

	font-size: 13px;
	font-weight: 500;
	color: var(--text-primary);
	white-space: nowrap;

	cursor: pointer;

	transition: all 0.2s ease;
}

.wrapper.disabled {
	opacity: 0.5;
	pointer-events: none;
}

.wrapper svg {
	fill: var(--opacity-40);

	margin-right: 8px;
}

.wrapper:hover {
	background: var(--opacity-05);
}

.wrapper:focus {
	outline: none;
	background: rgba(255, 255, 255, 0.05);
}
</style>
