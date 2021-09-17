<script>
export default {
	name: "Badge",
}
</script>

<template>
	<div :class="$style.wrapper">
		<slot />
	</div>
</template>

<style module>
.wrapper {
	display: flex;
	align-items: center;

	height: 20px;
	border-radius: 6px;
	background: var(--opacity-10);

	font-size: 11px;
	font-weight: 600;
	white-space: nowrap;
	color: var(--text-primary);

	padding: 0 6px;
}
</style>
