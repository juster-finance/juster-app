<script setup>
/**
 * UI
 */
import Modal from "@/components/ui/Modal"

defineProps({
	show: Boolean,
})
</script>

<template>
	<Modal :show="show" width="500" closable @onClose="$emit('onClose')">
		<div :class="$style.title">Confirm Transaction</div>
		<div :class="$style.description">
			Carefully double-check the correctness of the entered data
		</div>

		<Flex direction="column" gap="32px">
			<Flex justify="space-between">
				<div :class="$style.left">
					<span>Amount</span>
					<span>Your bet</span>
				</div>

				<div :class="$style.right">
					<span><b>10</b> XTZ</span>
					<span>$23,09</span>
				</div>
			</Flex>
			<Flex justify="space-between">
				<div :class="$style.left">
					<span>Type</span>
					<span>Selected event</span>
				</div>

				<div :class="$style.right">
					<span><b>Price Event</b></span>
					<span>Tezos (2.52), 6 hours</span>
				</div>
			</Flex>
			<Flex justify="space-between">
				<div :class="$style.left">
					<span>Balance</span>
				</div>

				<div :class="$style.right">
					<span><b>2,509</b>.32 XTZ</span>
					<span>10 XTZ = 0,39% of balance</span>
				</div>
			</Flex>
		</Flex>
	</Modal>
</template>

<style module>
.title {
	font-size: 20px;
	font-weight: 600;
	line-height: 1.2;
	color: var(--text-primary);

	margin-bottom: 8px;
}

.description {
	font-size: 14px;
	line-height: 1.6;
	font-weight: 500;
	color: var(--text-tertiary);

	margin-bottom: 40px;
}

.left {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.left span:nth-child(1) {
	font-size: 16px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-primary);
}

.left span:nth-child(2) {
	font-size: 13px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-tertiary);
	opacity: 0.5;
}

.right {
	display: flex;
	flex-direction: column;
	gap: 10px;
	align-items: flex-end;
}

.right span:nth-child(1) {
	font-size: 16px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-tertiary);
}

.right span b {
	font-weight: 600;
	color: var(--text-primary);
}

.right span:nth-child(2) {
	font-size: 13px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-tertiary);
}
</style>
