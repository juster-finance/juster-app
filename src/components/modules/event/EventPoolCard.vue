<script setup>
/**
 * Vendor
 */
import { computed } from "vue"
import { useRouter } from "vue-router"

/**
 * UI
 */
import Button from "@ui/Button.vue"

/**
 * Local
 */
import Pool from "@local/Pool.vue"

/**
 * Store
 */
import { useMarketStore } from "@store/market"

const marketStore = useMarketStore()

const props = defineProps({ event: { type: Object } })
const emit = defineEmits(["onLiquidity"])

const router = useRouter()

const pool = computed(() =>
	marketStore.lines.find((l) => l.currencyPairId === props.event.currencyPair.id && l.measurePeriod === props.event.measurePeriod),
)
</script>

<template>
	<Flex direction="column" gap="24" :class="$style.wrapper">
		<Flex direction="column" gap="8">
			<Text color="primary" size="16" height="12" weight="600"> Pools Distribution </Text>
			<Text color="tertiary" size="14" weight="500"> Visualization of stakes between directions </Text>
		</Flex>

		<Pool :event="event" />

		<router-link v-if="marketStore.lines.length" :to="`/pools/${pool.poolId}`">
			<Button type="secondary" size="medium" block keybind="D+L" @onKeybind="router.push(`/pools/${pool.poolId}`)">
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
