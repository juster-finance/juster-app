<script setup>
const props = defineProps({
	summary: Object,
})

const summaryDictionary = {
	totalDeposited: "Total Deposited",
	entrySharePrice: "Start Share Price",
	currentSharePrice: "Share Price",
	activeShares: "Shares",
	estimatedPositionsValue: "Positions Value",
	withdrawnShares: "Withdrawn Shares",
	withdrawnAmount: "Withdrawn Amount",
	realizedProfit: "Realized Profit",
	unrealizedProfit: "Unrealized Profit",
	lockedInClaims: "Locked in Claims",
}
</script>

<template>
	<div :class="$style.wrapper">
		<Flex direction="column" gap="8" :class="$style.head">
			<Text color="primary" size="16" weight="600">My Summary</Text>
			<Text color="tertiary" size="14" weight="500" height="14">
				Summary Description
			</Text>
		</Flex>

		<Flex direction="column" gap="24">
			<Flex
				v-for="(value, key) in summary"
				gap="8"
				wide
				justify="between"
			>
				<Text size="14" weight="600" color="tertiary">
					{{ summaryDictionary[key] }}
				</Text>
				<Text size="14" weight="600" color="primary">
					{{ value ? value.toFixed(2) : 0 }}
				</Text>
			</Flex>
		</Flex>
	</div>
</template>

<style module>
.wrapper {
	width: 100%;

	border-radius: 8px;
	background: var(--card-bg);
	border-top: 3px solid var(--border);

	padding: 24px;
}

.head {
	border-bottom: 1px solid var(--border);

	padding-bottom: 20px;
	margin-bottom: 24px;
}
</style>
