<template>
	<div :class="$style.wrapper">
		<slot />
	</div>
</template>

<style module>
.wrapper {
	display: flex;
	align-items: center;

	font-size: 12px;
	font-weight: 600;
	line-height: 24px;
	color: var(--text-tertiary);

	padding: 0 16px;

	margin-bottom: 4px;
}
</style>
