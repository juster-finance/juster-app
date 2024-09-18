<script setup>
import { computed } from "vue"

/**
 * Utils
 */
import { numberWithSymbol } from "@utils/amounts"
import { token, demoMode } from "@config"

/**
 * Store
 */
import { useAccountStore } from "@store/account"

/**
 * UI
 */
import Tooltip from "@ui/Tooltip.vue"
import { juster } from "@sdk"


const accountStore = useAccountStore()
const isTopUpAllowed = computed(() => accountStore.pkh && accountStore.balance <= demoMode.minBalanceToTopUp)

const handleTopUp = async () => {
	if (!isTopUpAllowed)
		return

	await juster.sdk.topUp()
	accountStore.updateBalance()
}
</script>

<template>
	<Tooltip v-if="isTopUpAllowed" placement="left">
		<Flex align="center" gap="8" :class="$style.wrapper" @click="handleTopUp">
			<Icon name="coins" size="14" color="green" />

			<Flex>
				<Text size="12" weight="700" color="tertiary">
					Top Up&nbsp;
				</Text>
				<Text size="12" weight="700" color="primary">
					{{ numberWithSymbol(demoMode.topUpAmount, ",") }}&nbsp;
				</Text>
				<Text size="12" weight="700" color="tertiary"> {{token.symbol}} </Text>
			</Flex>
		</Flex>

		<template #content>Get free demo tokens</template>
	</Tooltip>
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
