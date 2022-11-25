<script setup>
/**
 * UI
 */
import Button from "@ui/Button.vue"

/**
 * Local
 */
import Pool from "@local/Pool.vue"

defineProps({ event: { type: Object } })
const emit = defineEmits(["onLiquidity"])
</script>

<template>
	<div :class="$style.wrapper">
		<div :class="$style.title">Liquidity</div>

		<Pool :event="event" />

		<Button
			@click="emit('onLiquidity')"
			type="secondary"
			size="small"
			block
			:disabled="
				event.status !== 'NEW' || event.totalLiquidityProvided == 0
			"
			:class="$style.liquidity_btn"
			><Icon name="liquidity" size="12" />Add Liquidity</Button
		>
	</div>
</template>

<style module>
.wrapper {
	border-radius: 8px;
	border: 1px solid var(--border);
	padding: 20px;
	background: var(--card-bg);
}

.title {
	font-size: 14px;
	line-height: 1;
	font-weight: 500;
	color: var(--text-primary);

	margin-bottom: 20px;
}

.liquidity_btn {
	margin-top: 16px;
}

/* Params */
.params {
	display: flex;
	flex-direction: column;
	gap: 20px;

	margin-top: 32px;
}

.param {
	display: flex;
	justify-content: space-between;

	font-size: 14px;
	line-height: 1;
	font-weight: 600;
}

.param span:nth-child(1) {
	color: var(--text-tertiary);

	display: flex;
	align-items: center;
	gap: 6px;
	fill: var(--opacity-40);
}

.param span:nth-child(2) {
	display: flex;
	align-items: center;
	gap: 6px;

	color: var(--text-secondary);
}
</style>
