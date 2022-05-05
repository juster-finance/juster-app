<script setup>
/**
 * UI
 */
import Modal from "@/components/ui/Modal"
import Button from "@/components/ui/Button"

defineProps({
	show: { type: Boolean },
})
</script>

<template>
	<Modal :show="show" width="500" closable @onClose="$emit('onClose')">
		<div :class="$style.title">Notify Me</div>

		<div :class="$style.description">
			In the near future, we plan to add support for
			<span>Web-Push Notifications</span> and send them to you directly in
			your browser
		</div>
		<div :class="$style.description">
			Right now you can use our <span>Telegram Bot</span> or our
			<span>Discord Server</span>. Use them as a temporary substitute for
			notifications
		</div>

		<div :class="$style.subtitle">Select between</div>

		<div :class="$style.buttons">
			<Button type="secondary" size="small" block disabled>
				<Icon name="telegram" size="12" />Telegram Bot
			</Button>
			<Button type="secondary" size="small" block disabled>
				<Icon name="discord" size="12" />Discord Server
			</Button>
		</div>
	</Modal>
</template>

<style module>
.wrapper {
}

.title {
	font-size: 20px;
	font-weight: 600;
	line-height: 1.2;
	color: var(--text-primary);

	margin-bottom: 24px;
}

.description {
	font-size: 14px;
	line-height: 1.6;
	font-weight: 500;
	color: var(--text-tertiary);

	margin-bottom: 16px;
}

.description span {
	color: var(--text-secondary);
}

.subtitle {
	font-size: 14px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-secondary);

	margin: 24px 0 12px 0;
}

.buttons {
	display: flex;
	gap: 16px;
}
</style>
