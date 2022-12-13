<script setup>
/**
 * Vendor
 */
import { ref } from "vue"

/**
 * UI
 */
import Toggle from "@ui/Toggle.vue"
import { Dropdown, DropdownItem, DropdownTrigger } from "@ui/Dropdown"

const showTezosExplorersDropdown = ref(false)
const showDefaultChartDropdown = ref(false)
const showSlippageToleranceDropdown = ref(false)
</script>

<template>
	<Flex direction="column" gap="40">
		<Flex align="center" :class="$style.app_card">
			<Icon name="logo_symbol" size="24" color="brand" />

			<div :class="$style.divider" />

			<Flex justify="between" align="center" wide>
				<Flex direction="column" gap="8">
					<Text size="12" weight="600" color="secondary">
						Juster Finance Application
					</Text>
					<Flex>
						<Text size="12" weight="500" color="tertiary">
							Version 1.2.16
						</Text>
						<Text size="12" weight="500" color="support"
							>, updated 2 days ago</Text
						>
					</Flex>
				</Flex>

				<Flex align="center" gap="12">
					<Icon name="asterisk" size="16" color="tertiary" />
					<Icon name="github" size="16" color="tertiary" />
				</Flex>
			</Flex>
		</Flex>

		<Flex direction="column" gap="24">
			<!-- Tezos Explorer -->
			<Flex justify="between" gap="24">
				<Flex direction="column" gap="6">
					<Text size="13" weight="600" color="primary">
						Tezos Explorer
					</Text>
					<Text size="13" weight="500" color="tertiary" height="16">
						Select a preferred explorer for operations, etc
					</Text>
				</Flex>

				<Dropdown :forceOpen="showTezosExplorersDropdown">
					<template #trigger>
						<DropdownTrigger
							label="TzKT"
							@toggle="
								showTezosExplorersDropdown =
									!showTezosExplorersDropdown
							"
							@onClose="showTezosExplorersDropdown = false"
						/>
					</template>

					<template #dropdown>
						<DropdownItem data-active="true">
							<Icon name="check" size="16" color="secondary" />
							TzKT
						</DropdownItem>
						<DropdownItem>
							<Icon name="empty" size="16" />
							TzStats
						</DropdownItem>
					</template>
				</Dropdown>
			</Flex>

			<!-- Default Chart -->
			<Flex justify="between" gap="24">
				<Flex direction="column" gap="6">
					<Text size="13" weight="600" color="primary">
						Default Chart
					</Text>
					<Text size="13" weight="500" color="tertiary" height="16">
						Select the default chart to use on the Event page
					</Text>
				</Flex>

				<Dropdown :forceOpen="showDefaultChartDropdown">
					<template #trigger>
						<DropdownTrigger
							label="TradingView"
							@toggle="
								showDefaultChartDropdown =
									!showDefaultChartDropdown
							"
							@onClose="showDefaultChartDropdown = false"
						/>
					</template>

					<template #dropdown>
						<DropdownItem>
							<Icon name="empty" size="16" />
							Simple
						</DropdownItem>
						<DropdownItem data-active="true">
							<Icon name="check" size="16" color="secondary" />
							TradingView
						</DropdownItem>
						<DropdownItem>
							<Icon name="empty" size="16" />
							Cryptowatch
						</DropdownItem>
					</template>
				</Dropdown>
			</Flex>

			<!-- Test Network Toggle -->
			<Flex justify="between" gap="24">
				<Flex direction="column" gap="6">
					<Text size="13" weight="600" color="primary">
						Test Network
					</Text>
					<Text size="13" weight="500" color="tertiary" height="16">
						Get access to advanced features for debugging this
						application
					</Text>
				</Flex>

				<Toggle />
			</Flex>
		</Flex>

		<Flex direction="column" gap="24">
			<Text size="16" weight="600" color="primary">Staking</Text>

			<!-- Slippage Tolerance -->
			<Flex justify="between" gap="24">
				<Flex direction="column" gap="6">
					<Text size="13" weight="600" color="primary">
						Slippage Tolerance
					</Text>
					<Text size="13" weight="500" color="tertiary" height="16">
						Select the percentage of the balance to check the amount
					</Text>
				</Flex>

				<Dropdown :forceOpen="showSlippageToleranceDropdown">
					<template #trigger>
						<DropdownTrigger
							label="3%"
							width="70"
							@toggle="
								showSlippageToleranceDropdown =
									!showSlippageToleranceDropdown
							"
							@onClose="showSlippageToleranceDropdown = false"
						/>
					</template>

					<template #dropdown>
						<DropdownItem data-active="true">
							<Icon name="check" size="16" color="secondary" />
							3%
						</DropdownItem>
						<DropdownItem>
							<Icon name="empty" size="16" />
							5%
						</DropdownItem>
						<DropdownItem>
							<Icon name="empty" size="16" />
							10%
						</DropdownItem>
					</template>
				</Dropdown>
			</Flex>

			<!-- Warning at large amount -->
			<Flex justify="between" gap="24">
				<Flex direction="column" gap="6">
					<Text size="13" weight="600" color="primary">
						Warning at large amount
					</Text>
					<Text size="13" weight="500" color="tertiary" height="16">
						Protection against incorrect accidentally entered
						amounts
					</Text>
				</Flex>

				<Toggle />
			</Flex>

			<!-- Events only by Juster Team -->
			<Flex justify="between" gap="24">
				<Flex direction="column" gap="6">
					<Text size="13" weight="600" color="primary">
						Events only by Juster Team
					</Text>
					<Text size="13" weight="500" color="tertiary" height="16">
						Show events strictly from the Juster Team only
					</Text>
				</Flex>

				<Toggle />
			</Flex>

			<!-- Hide events with low liquidity -->
			<Flex justify="between" gap="24">
				<Flex direction="column" gap="6">
					<Text size="13" weight="600" color="primary">
						Hide events with low liquidity
					</Text>
					<Text size="13" weight="500" color="tertiary" height="16">
						Events without liquidity can not provide a guaranteed
						payment
					</Text>
				</Flex>

				<Toggle />
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.app_card {
	height: 60px;

	background: rgba(255, 255, 255, 0.03);
	border-radius: 8px;

	padding: 0 22px 0 18px;
}

.app_card img {
	width: 40px;
	height: 40px;
}

.divider {
	width: 2px;
	height: 28px;

	background: var(--border);
	border-radius: 50px;

	margin: 0 16px 0 18px;
}
</style>
