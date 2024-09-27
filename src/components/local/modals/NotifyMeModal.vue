<script setup>
/**
 * UI
 */
import Modal from "@ui/Modal.vue"
import Button from "@ui/Button.vue"

const emit = defineEmits(["onClose"])
defineProps({
	show: { type: Boolean },
})
</script>

<template>
	<Modal :show="show" width="500" new closable @onClose="emit('onClose')">
		<Flex align="center" justify="between" :class="$style.head">
			<Flex align="center" gap="8">
				<Icon name="search" size="16" color="secondary" />

				<Text size="14" weight="600" color="primary">Notify Me</Text>
			</Flex>

			<Icon
				@click="emit('onClose')"
				name="close"
				size="16"
				color="tertiary"
				:class="$style.close_icon"
			/>
		</Flex>

		<Flex direction="column" gap="32" :class="$style.base">
			<Flex direction="column" gap="16">
				<div :class="$style.description">
					In the near future, we plan to add support for
					<span>Web-Push Notifications</span> and send them to you
					directly in your browser
				</div>
				<div :class="$style.description">
					Right now you can use our <span>Telegram Bot</span>. Use them as a temporary
					substitute for notifications
				</div>
			</Flex>

			<Flex direction="column" gap="12">
				<div :class="$style.subtitle">Select between</div>
				<div :class="$style.buttons">
					<Button type="secondary" size="small" block disabled>
						<Icon name="telegram" size="12" />Telegram Bot
					</Button>
				</div>
			</Flex>
		</Flex>
	</Modal>
</template>

<style module>
.head {
	height: 56px;

	padding: 0 20px;
}

.close_icon {
	cursor: pointer;
}

.description {
	font-size: 14px;
	line-height: 1.6;
	font-weight: 500;
	color: var(--text-tertiary);
}

.description span {
	color: var(--text-secondary);
}

.base {
	padding: 0px 20px 20px 20px;
}

.subtitle {
	font-size: 14px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-secondary);
}

.buttons {
	display: flex;
	gap: 16px;
}
</style>
