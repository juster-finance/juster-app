<template>
	<Text
		size="14"
		height="16"
		weight="500"
		color="tertiary"
		:class="$style.wrapper"
	>
		<slot />
	</Text>
</template>

<style module>
.wrapper {
	border-left: 3px solid var(--border);

	padding-left: 16px;
	margin-bottom: 40px;
}
</style>
