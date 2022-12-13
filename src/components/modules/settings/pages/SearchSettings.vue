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

const showShortcutDropdown = ref(false)

const useShortcut = ref(false)
const isShortcutCustomizationAvailable = ref(false)
</script>

<template>
	<Flex direction="column" gap="24">
		<Text size="16" weight="600" color="primary">Command Menu</Text>

		<Flex justify="between" gap="24">
			<Flex direction="column" gap="6">
				<Text size="13" weight="600" color="primary">
					Use Shortcut
				</Text>
				<Text size="13" weight="500" color="tertiary" height="16">
					Quick access to commands or searches via shortcut
				</Text>
			</Flex>

			<Toggle v-model="useShortcut" />
		</Flex>

		<Flex
			justify="between"
			gap="24"
			:class="!useShortcut && $style.disabled"
		>
			<Flex direction="column" gap="6">
				<Text size="13" weight="600" color="primary"> Shortcut </Text>
				<Text size="13" weight="500" color="tertiary" height="16">
					Choose from a ready-made list
				</Text>
			</Flex>

			<Dropdown :forceOpen="showShortcutDropdown">
				<template #trigger>
					<DropdownTrigger
						label="Command + K"
						@toggle="showShortcutDropdown = !showShortcutDropdown"
						@onClose="showShortcutDropdown = false"
					/>
				</template>

				<template #dropdown>
					<DropdownItem data-active="true">
						<Icon name="check" size="16" color="secondary" />
						Command + K
					</DropdownItem>
					<DropdownItem>
						<Icon name="empty" size="16" />
						Command + S
					</DropdownItem>
				</template>
			</Dropdown>
		</Flex>
	</Flex>
</template>

<style module>
.disabled {
	pointer-events: none;
	opacity: 0.4;
}
</style>
