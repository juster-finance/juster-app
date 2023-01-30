<script setup>
defineProps({
	expanded: Boolean,
})
</script>

<template>
	<div :class="[$style.toggleable, expanded && $style.expanded]">
		<div :class="$style.inside">
			<slot />
		</div>
	</div>
</template>

<style module>
.toggleable {
	display: grid;
	grid-template-rows: 0fr;
	overflow: hidden;

	transition: all 1s var(--bezier);
}

.toggleable.expanded {
	grid-template-rows: 1fr;
}

.inside {
	min-height: 0;
}

.mgs {
	border-top: 1px solid var(--border);

	padding-top: 20px;
	margin-top: 24px;
}
</style>
