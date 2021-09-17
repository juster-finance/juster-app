<script>
import { defineComponent } from "vue"

export default defineComponent({
	name: "Stat",
	props: { name: String },
})
</script>

<template>
	<div :class="$style.wrapper">
		<div :class="$style.key">{{ name }}</div>
		<div :class="$style.value"><slot /></div>
	</div>
</template>

<style module>
.wrapper {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.key {
	font-size: 14px;
	line-height: 1.6;
	font-weight: 500;
	color: var(--text-tertiary);
}

.value {
	display: flex;
	align-items: center;
	gap: 6px;

	font-size: 14px;
	line-height: 1.6;
	font-weight: 500;
	color: var(--text-primary);
}

.value span {
	color: var(--text-tertiary);
}
</style>