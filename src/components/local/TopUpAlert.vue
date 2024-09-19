<script setup>

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
import { juster } from "@sdk"
import { useNotificationsStore } from "@store/notifications";
import { token, demoMode } from "@config";


const accountStore = useAccountStore()
const notificationsStore = useNotificationsStore()

const handleTopUp = async () => {
	if (!accountStore.isTopUpAllowed)
		return

	await juster.sdk.topUp()
	await accountStore.updateBalance()
	notificationsStore.create({
		notification: {
			type: "Success",
			title: `You have received ${numberWithSymbol(demoMode.topUpAmount, ",")} ${token.symbol}`,
			description: "Check out your balance",
			autoDestroy: true,
		},
	});
}
</script>

<template>
	<Tooltip v-if="accountStore.isTopUpAllowed" placement="left">
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
