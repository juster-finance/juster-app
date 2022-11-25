<script setup>
/**
 * Vendor
 */
import { computed } from "vue"

/**
 * UI
 */
import Button from "@ui/Button.vue"

const emit = defineEmits(["onDepositLiquidity"])
const props = defineProps({
	pools: Array,
	poolsStates: Object,
})

const isDepositAvailable = computed(() => {
	return (
		props.pools.length > 1 &&
		props.pools.length === Object.keys(props.poolsStates).length
	)
})

const handleDepositLiquidityClick = () => {
	if (!isDepositAvailable.value) return
	emit("onDepositLiquidity")
}
</script>

<template>
	<div :class="$style.wrapper">
		<Flex align="center" justify="between" :class="$style.head">
			<Text color="primary" size="16" weight="600">My Funds</Text>

			<Text color="blue" size="14" weight="600"> Request Funds </Text>
		</Flex>

		<Flex align="center" gap="32" :class="$style.funds">
			<Flex align="center" gap="14" :class="$style.badge">
				<Icon
					name="coins"
					size="20"
					color="secondary"
					:class="$style.icon"
				/>

				<Flex direction="column" gap="8">
					<Text color="primary" size="16" weight="600">3,521.34</Text>
					<Text
						color="tertiary"
						size="13"
						weight="500"
						:class="$style.badge__subtitle"
					>
						Total Value Locked
					</Text>
				</Flex>
			</Flex>

			<Flex align="center" gap="14" :class="$style.badge">
				<Icon
					name="coins_plus"
					size="20"
					color="green"
					:class="$style.icon"
				/>

				<Flex direction="column" gap="8">
					<Text color="primary" size="16" weight="600">3,521.34</Text>
					<Text
						color="tertiary"
						size="13"
						weight="500"
						:class="$style.badge__subtitle"
					>
						Available Income
					</Text>
				</Flex>
			</Flex>
		</Flex>

		<Flex direction="column" gap="12" :class="$style.progress">
			<Flex align="center" justify="between" wide>
				<Text size="14" color="secondary" weight="600">
					Progress of Claims
				</Text>

				<Flex align="center" gap="4">
					<Text size="14" color="tertiary" weight="600">
						7 of 10,
					</Text>

					<Text size="14" color="secondary" weight="600"> 70% </Text>

					<Icon name="arrow" size="14" color="tertiary" />
				</Flex>
			</Flex>

			<div :class="$style.bar">
				<div :class="$style.bar_progress" />
			</div>
		</Flex>

		<Flex direction="column" gap="12" :class="$style.progress">
			<Flex align="center" justify="between" wide>
				<Text size="14" color="secondary" weight="600">
					Progress of Acceptance
				</Text>

				<Flex align="center" gap="4">
					<Text size="14" color="tertiary" weight="600">
						7 of 10,
					</Text>

					<Text size="14" color="secondary" weight="600"> 70% </Text>

					<Icon name="arrow" size="14" color="tertiary" />
				</Flex>
			</Flex>

			<div :class="$style.bar">
				<div :class="$style.bar_progress" />
			</div>
		</Flex>

		<Flex direction="column" gap="12" :class="$style.buttons">
			<Button
				@click="handleDepositLiquidityClick"
				@onKeybind="handleDepositLiquidityClick"
				:disabled="!isDepositAvailable"
				type="primary"
				size="medium"
				keybind="D"
				block
			>
				<Icon name="plus_circle" size="16" />Deposit Liquidity
			</Button>

			<Button type="secondary" size="medium" block keybind="C">
				<Icon name="credit_add" size="16" color="green" />Get available
				claims
			</Button>

			<Text
				size="12"
				color="support"
				weight="500"
				height="16"
				align="center"
				:class="$style.hint"
			>
				You can pick up the claims without waiting for the unconfirmed
				ones. Available claims will be formed in one batch request
			</Text>
		</Flex>
	</div>
</template>

<style module>
.wrapper {
	width: 100%;
	border-radius: 10px;

	background: var(--card-bg);

	padding: 24px;
}

.head {
	border-bottom: 1px solid var(--border);

	padding-bottom: 20px;
}

.funds {
	border-bottom: 1px solid var(--border);

	padding: 24px 0;
}

.badge .icon {
	box-sizing: content-box;
	border-radius: 8px;
	background: rgba(255, 255, 255, 0.05);

	padding: 12px;
}

.badge__subtitle {
	white-space: nowrap;
}

.progress {
	margin-top: 24px;
}

.bar {
	height: 12px;
	border-radius: 3px;
	background: rgba(255, 255, 255, 0.05);
}

.buttons {
	margin-top: 24px;
}

.hint {
	padding: 0 16px;
}

@media (max-width: 500px) {
	.funds {
		flex-direction: column;
		align-items: flex-start;
		gap: 16px;
	}
}
</style>
