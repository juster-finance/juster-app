<script setup>
/**
 * UI
 */
import Toggle from "@ui/Toggle.vue"
import Selector from "@ui/Selector.vue"
</script>

<template>
	<Flex direction="column" gap="24">
		<Flex direction="column" gap="8" wide>
			<Text size="13" weight="600" color="primary"> Currency </Text>

			<Flex justify="between" gap="8">
				<Selector name="Tezos" :selected="true">
					<template #hint>
						<Text size="11" weight="600" color="tertiary">
							Default
						</Text>
					</template>
				</Selector>
				<Selector name="U.S. Dollar" :selected="false" />
				<Selector name="Euro" :selected="false" />
			</Flex>

			<Text size="13" weight="500" color="support" height="160">
				Prices by Binance API
			</Text>
		</Flex>

		<Flex direction="column" gap="8" wide>
			<Text size="13" weight="600" color="primary"> Abbreviation </Text>

			<Flex justify="between" gap="8">
				<Selector name="Short" :selected="true">
					<template #hint>
						<Text size="11" weight="600" color="tertiary">
							5.7K
						</Text>
					</template>
				</Selector>
				<Selector name="Full" :selected="false">
					<template #hint>
						<Text size="11" weight="600" color="tertiary">
							5,700.52
						</Text>
					</template>
				</Selector>
				<Selector name="Custom" :selected="false" disabled>
					<template #hint>
						<Text size="11" weight="600" color="tertiary">
							Soon
						</Text>
					</template>
				</Selector>
			</Flex>

			<Text size="13" weight="500" color="support" height="160">
				Note that very large values can affect the structure of the
				interface, we strongly recommend using a short display format
			</Text>
		</Flex>

		<Flex justify="between" gap="24">
			<Flex direction="column" gap="6">
				<Text size="13" weight="600" color="primary">
					Show digits after the decimal point
				</Text>
				<Text size="13" weight="500" color="tertiary" height="16">
					This can affect the accuracy of small values
				</Text>
			</Flex>

			<Toggle />
		</Flex>
	</Flex>
</template>

<style module></style>
