<script setup>
import { computed } from "vue"

/**
 * Utils
 */
import { numberWithSymbol } from "@utils/amounts"

/**
 * Store
 */
import { useAccountStore } from "@store/account"

/**
 * UI
 */
import Tooltip from "@ui/Tooltip.vue"

const accountStore = useAccountStore()

const reward = computed(() => {
	const total = accountStore.wonPositions.reduce(
		(acc, curr) => (acc += curr.value),
		0,
	)
	return total
})
</script>

<template>
	<router-link v-if="accountStore.wonPositions.length" to="/withdrawals">
		<Tooltip placement="left">
			<Flex align="center" gap="8" :class="$style.wrapper">
				<Icon name="coins" size="14" color="green" />

				<Flex>
					<Text size="12" weight="700" color="primary">
						{{ numberWithSymbol(reward, ",") }}&nbsp;
					</Text>
					<Text size="12" weight="700" color="tertiary"> {{token.symbol}} </Text>
				</Flex>
			</Flex>

			<template #content>Available funds for withdrawal</template>
		</Tooltip>
	</router-link>
</template>

<style module>
.wrapper {
	height: 32px;
	border-radius: 6px;
	background: var(--btn-secondary-bg);

	padding: 0 12px 0 10px;

	transition: all 0.2s ease;
}

.wrapper:hover {
	background: var(--btn-secondary-bg-hover);
}

.wrapper:active {
	transform: translateY(1px);
}
</style>
