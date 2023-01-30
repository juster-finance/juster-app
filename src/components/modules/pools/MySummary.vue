<script setup>
/**
 * Vendor
 */
import { ref } from "vue"

/**
 * UI
 */
import Toggleable from "@ui/Toggleable.vue"

const props = defineProps({
	summary: Object,
})

const expanded = ref(false)

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
		<Flex
			@click="expanded = !expanded"
			justify="between"
			:class="$style.head"
		>
			<Flex direction="column" gap="8">
				<Text color="primary" size="16" weight="600">My Summary</Text>
				<Text color="tertiary" size="14" weight="500" height="14">
					Your data for the selected pool
				</Text>
			</Flex>

			<Icon
				name="arrow"
				size="20"
				color="tertiary"
				:class="[$style.arrow_icon, expanded && $style.toggle]"
			/>
		</Flex>

		<Toggleable :expanded="expanded">
			<Flex direction="column" gap="24" :class="$style.mgs">
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
		</Toggleable>
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
	cursor: pointer;
}

.head:hover .arrow_icon {
	fill: var(--text-secondary);
}

.arrow_icon {
	transition: all 0.2s ease;
}

.arrow_icon.toggle {
	transform: rotate(180deg);
}

.mgs {
	border-top: 1px solid var(--border);

	padding-top: 20px;
	margin-top: 24px;
}
</style>
