<script setup>
defineProps({
	width: {
		type: [String, Number],
		default: 1250,
	},
})
</script>

<template>
	<div :class="$style.wrapper">
		<div
			:class="$style.content"
			:style="{
				maxWidth: `${width}px`,
			}"
		>
			<slot />
		</div>
	</div>
</template>

<style module>
.wrapper {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin: 0 32px 80px 32px;
	padding-top: 40px;

	flex: 1;
}

.content {
	width: 100%;
}

@media (max-width: 700px) {
	.wrapper {
		margin: 0 16px 80px 16px;
		padding-top: 24px;
	}
}
</style>
