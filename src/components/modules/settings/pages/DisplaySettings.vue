<script setup>
/**
 * Vendor
 */
import { ref } from "vue"

/**
 * UI
 */
import Selector from "@ui/Selector.vue"
import { Dropdown, DropdownItem, DropdownTrigger } from "@ui/Dropdown"

const showLanguageDropdown = ref(false)
</script>

<template>
	<Flex direction="column" gap="24">
		<Flex justify="between" gap="24">
			<Flex direction="column" gap="6">
				<Text size="13" weight="600" color="primary"> Language </Text>
				<Text size="13" weight="500" color="tertiary" height="16">
					Select a preferred language for interface
				</Text>
			</Flex>

			<Dropdown :forceOpen="showLanguageDropdown">
				<template #trigger>
					<DropdownTrigger
						label="English"
						@toggle="showLanguageDropdown = !showLanguageDropdown"
						@onClose="showLanguageDropdown = false"
					/>
				</template>

				<template #dropdown>
					<DropdownItem data-active="true">
						<Icon name="check" size="16" color="secondary" />
						English
					</DropdownItem>
				</template>
			</Dropdown>
		</Flex>

		<Flex direction="column" gap="8" wide>
			<Text size="13" weight="600" color="primary">
				Display alias names
			</Text>

			<Flex justify="between" gap="8">
				<Selector name="TzKT Aliases" :selected="true" />
				<Selector name="Wallet Address" :selected="false" />
			</Flex>

			<Text size="13" weight="500" color="support" height="160">
				Show TzKT aliases instead of wallet address
			</Text>
		</Flex>

		<Flex direction="column" gap="8" wide>
			<Text size="13" weight="600" color="primary"> Font size </Text>

			<Flex justify="between" gap="8">
				<Selector name="Default" hint="Aa" :selected="true">
					<template #hint>
						<Text size="12" weight="600" color="tertiary">
							Aa
						</Text>
					</template>
				</Selector>
				<Selector name="Large" hint="Aa" :selected="false">
					<template #hint>
						<Text size="14" weight="600" color="tertiary">
							Aa
						</Text>
					</template>
				</Selector>
				<Selector name="Small" hint="Aa" :selected="false">
					<template #hint>
						<Text size="10" weight="600" color="tertiary">
							Aa
						</Text>
					</template>
				</Selector>
			</Flex>
		</Flex>

		<Flex direction="column" gap="8" wide>
			<Text size="13" weight="600" color="primary"> Time format </Text>

			<Flex justify="between" gap="8">
				<Selector name="24-hour" :selected="true" />
				<Selector name="12-hour" :selected="false" />
			</Flex>
		</Flex>

		<Flex direction="column" gap="8" wide>
			<Text size="13" weight="600" color="primary">
				Event status colors
			</Text>

			<Flex justify="between" gap="8">
				<Flex align="center" justify="between" :class="$style.badge">
					<Text size="13" weight="600" color="primary"> New </Text>
					<Icon name="event_new" size="16" color="purple" />
				</Flex>
				<Flex align="center" justify="between" :class="$style.badge">
					<Text size="13" weight="600" color="primary">
						Running
					</Text>
					<Icon name="event_active" size="16" color="yellow" />
				</Flex>
				<Flex align="center" justify="between" :class="$style.badge">
					<Text size="13" weight="600" color="primary">
						Finished
					</Text>
					<Icon name="event_finished" size="16" color="green" />
				</Flex>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.badge {
	width: 100%;
	height: 32px;

	border-radius: 6px;
	background: rgba(255, 255, 255, 0.05);
	cursor: pointer;

	padding: 0 12px;

	transition: all 0.2s ease;
}

.badge:focus {
	outline: none;
	box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
}
</style>
