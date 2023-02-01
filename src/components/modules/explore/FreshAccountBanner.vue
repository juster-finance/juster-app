<script setup>
/**
 * Vendor
 */
import { useRouter } from "vue-router"

/**
 * UI
 */
import Button from "@ui/Button.vue"
import Tooltip from "@ui/Tooltip.vue"

const router = useRouter()
</script>

<template>
	<Flex gap="24" :class="$style.wrapper">
		<Icon name="marker_pin" size="32" :class="$style.pin_icon" />

		<div :class="$style.base">
			<Text
				size="16"
				weight="600"
				color="primary"
				height="14"
				:class="$style.title"
			>
				Your account is ready for your first stake or liquidity deposit
			</Text>
			<Text
				size="14"
				weight="500"
				color="tertiary"
				height="16"
				:class="$style.description"
			>
				Even though your account is currently empty, you can still
				access some basic features of Juster, such as placing your first
				stake or deposit liquidity:
			</Text>

			<Flex direction="column" gap="20" :class="$style.tasks">
				<Flex gap="8" align="center" :class="$style.task">
					<Icon name="price_event" size="16" />
					<Text size="14" weight="600" color="primary">
						Make your first stake
					</Text>
				</Flex>

				<Flex gap="8" align="center" :class="$style.task">
					<Icon name="liquidity" size="16" />
					<Text size="14" weight="600" color="primary">
						Make your first liquidity deposit
					</Text>
				</Flex>

				<Flex gap="8" align="center" :class="$style.task">
					<Icon name="money" size="16" />
					<Text size="14" weight="600" color="primary">
						Withdraw available funds
					</Text>
				</Flex>
			</Flex>

			<Flex align="center" gap="16" :class="$style.actions">
				<Button
					@click="router.push('/events')"
					type="white"
					size="small"
				>
					<Icon name="zap_fast" size="16" /> Join your first Price
					Event
				</Button>
				<Button
					@click="router.push('/docs')"
					type="secondary"
					size="small"
				>
					<Icon name="book" size="16" /> I need help getting started
				</Button>
			</Flex>
		</div>

		<Tooltip
			placement="bottom-end"
			textAlign="left"
			:class="$style.help_icon"
		>
			<Icon name="help" size="16" />

			<template #content>
				<span>
					As soon as you make your first stake<br />
					or deposit, this window disappears.
				</span>
			</template>
		</Tooltip>
	</Flex>
</template>

<style module>
.wrapper {
	position: relative;

	background: var(--card-bg);
	border-radius: 8px;

	padding: 24px 24px 32px 24px;
}

.pin_icon {
	fill: var(--green);
}

.pin_icon path:nth-child(1) {
	animation: material-spinner 1.5s infinite;
}

.help_icon {
	position: absolute;
	top: 20px;
	right: 20px;

	fill: var(--text-tertiary);
}

@keyframes material-spinner {
	0% {
		transform: translateY(0px);
		opacity: 0.5;
	}
	50% {
		transform: translateY(-2px);
		opacity: 1;
	}
	75% {
		transform: translateY(-2px);
		opacity: 1;
	}
	100% {
		transform: translateY(0px);
		opacity: 0.5;
	}
}

.title {
	margin-bottom: 8px;
}

.description {
	max-width: 600px;

	margin-bottom: 24px;
}

.tasks {
	margin-bottom: 32px;
}

.task {
	fill: var(--text-tertiary);

	cursor: pointer;

	margin: 0 -20px;
	padding: 0 20px;
}

@media (max-width: 600px) {
	.wrapper {
		flex-direction: column;
	}

	.actions {
		flex-direction: column;
		align-items: flex-start;
	}
}
</style>
