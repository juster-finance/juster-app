<script setup>
/**
 * Vendor
 */
import { useRouter } from "vue-router"

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

const router = useRouter()
</script>

<template>
	<Flex direction="column" gap="24" :class="$style.wrapper">
		<Flex direction="column" gap="8">
			<Text color="primary" size="16" height="12" weight="600">
				Pools Distribution
			</Text>
			<Text color="tertiary" size="14" weight="500">
				Visualization of stakes between directions
			</Text>
		</Flex>

		<Pool :event="event" />

		<router-link to="/pools">
			<Button
				type="secondary"
				size="medium"
				block
				keybind="D+L"
				@onKeybind="router.push('/pools')"
				:disabled="
					event.status !== 'NEW' || event.totalLiquidityProvided == 0
				"
			>
				<Icon name="server" size="12" />Deposit Liquidity
			</Button>
		</router-link>
	</Flex>
</template>

<style module>
.wrapper {
	border-radius: 8px;
	border-top: 3px solid var(--border);
	background: var(--card-bg);

	padding: 24px;
}
</style>
