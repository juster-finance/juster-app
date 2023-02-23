<template>
	<span :class="$style.wrapper">
		<slot />
	</span>
</template>

<style module>
.wrapper {
	background: rgba(255, 255, 255, 0.05);
	border-radius: 6px;

	font-weight: 600;
	color: var(--text-blue);

	padding: 4px 6px;
}
</style>
