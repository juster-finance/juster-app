<script setup>
/**
 * Vendor
 */
import { ref } from "vue"

/**
 * UI
 */
import Modal from "@ui/Modal.vue"
import Button from "@ui/Button.vue"

const props = defineProps({
	show: Boolean,
})
const emit = defineEmits(["onClose"])

const tabs = ref([
	{
		type: "Deposit",
		title: "Adding liquidity to pools",
		icon: "plus_circle",
		items: [
			"Deposit to the pool is not instant",
			"Funds will be accepted depending on the period",
			"Funds are converted into shares",
			"The APY calculation is approximate",
		],
	},
	{
		type: "Entries",
		title: "Acceptance of your funds",
		icon: "checkcircle",
		items: [
			"Entry acceptance depends on the pool period",
			"Entries smaller than 1 XTZ need to be approved manually",
			"You cannot revoke the approval of the entry",
		],
	},
	{
		type: "Claims",
		title: "Accepting withdrawal requests",
		icon: "checkcircle",
		items: [
			"The withdrawal request is confirmed depending on the period of the event in which your funds are used",
			"After confirming, the withdrawal to the wallet is done manually",
			"The claims in the confirmation process merging",
		],
	},
	{
		type: "Withdraw",
		title: "Withdrawal to a wallet",
		icon: "money",
		items: [
			"Withdrawal to the wallet is done manually at any time when at least one of the claims is ready",
			"If the withdrawal is coming from several pools at once, it may take more time than from one pool",
		],
	},
])
const activeTab = ref(0)
</script>

<template>
	<Modal new :show="show" width="550" closable @onClose="emit('onClose')">
		<Flex align="center" justify="between" :class="$style.head">
			<Flex align="center" gap="8">
				<Icon name="lightbulb" size="16" color="secondary" />

				<Text @click="emit('onBack')" size="14" weight="600" color="primary" :class="$style.head_btn">
					Liquidity Pools guides
				</Text>
			</Flex>

			<Icon @click="emit('onClose')" name="close" size="16" color="tertiary" :class="$style.close_icon" />
		</Flex>

		<Flex direction="column" gap="32" :class="$style.base">
			<Flex direction="column" gap="16">
				<Flex align="center" gap="32">
					<Text size="14" weight="600" color="tertiary"> Learn about </Text>

					<Text
						v-for="(tab, index) in tabs"
						@click="activeTab = index"
						size="14"
						weight="600"
						:color="activeTab === index ? 'blue' : 'secondary'"
						:class="$style.tab_btn"
					>
						{{ tab.type }}
					</Text>
				</Flex>

				<div :class="$style.divider" />
			</Flex>

			<Flex v-if="activeTab === 3" gap="12" :class="$style.warning_badge">
				<Icon name="money" size="16" color="orange" />

				<Flex direction="column" gap="8">
					<Text size="14" weight="600" color="primary"> Currently the APY is unstable </Text>
					<Text size="13" weight="500" color="tertiary" height="16">
						Liquidity pools were launched recently and are just beginning to gain momentum. More time is needed to stabilize the
						annual percentage yield and other indicators (utilization, risk index, etc).
					</Text>
				</Flex>
			</Flex>

			<Flex gap="12">
				<Icon :name="tabs[activeTab].icon" size="20" color="tertiary" />

				<Flex direction="column" gap="12">
					<Text size="15" weight="600" color="primary" height="14">
						{{ tabs[activeTab].title }}
					</Text>

					<Flex direction="column" gap="6">
						<Text
							v-for="item in tabs[activeTab].items"
							size="14"
							weight="500"
							color="tertiary"
							height="16"
							:class="$style.tab_item"
						>
							{{ item }}
						</Text>
					</Flex>
				</Flex>
			</Flex>

			<Flex direction="column" gap="16">
				<div :class="$style.divider" />

				<router-link to="/docs/pools-overview">
					<Button type="secondary" size="small" block>
						Learn more in docs
						<Icon name="open" size="16" color="tertiary" />
					</Button>
				</router-link>
			</Flex>
		</Flex>
	</Modal>
</template>

<style module>
.head {
	height: 56px;

	padding: 0 20px;
}

.head_btn {
	cursor: pointer;
}

.close_icon {
	cursor: pointer;
}

.base {
	padding: 8px 20px 20px 20px;
}

.divider {
	width: 100%;
	height: 1px;
	background: var(--border);
}

.tab_btn {
	cursor: pointer;

	transition: color 0.2s ease;
}

.tab_btn:hover {
	color: var(--text-blue);
}

.tab_item {
	max-width: 350px;
}

.warning_badge {
	border-radius: 8px;
	background: var(--app-bg);

	padding: 16px;
}
</style>
