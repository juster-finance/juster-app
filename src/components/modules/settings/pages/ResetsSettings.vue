<script setup>
/**
 * UI
 */
import Button from "@ui/Button.vue"
</script>

<template>
	<Flex direction="column" gap="16">
		<Button type="secondary" size="medium">
			<Icon name="flip_back" size="16" color="secondary" />
			Reset my settings
		</Button>

		<Button type="secondary" size="medium">
			<Icon name="flip_back" size="16" color="secondary" />
			Reset user flag by name
		</Button>

		<Button type="secondary" size="medium">
			<Icon name="flip_back" size="16" color="secondary" />
			Reset all user flags
		</Button>

		<Button type="secondary" size="medium">
			<Icon name="flip_back" size="16" color="secondary" />
			Log current settings
		</Button>

		<Flex direction="column" gap="8">
			<Button type="secondary" size="medium">
				<Icon name="flip_back" size="16" color="secondary" />
				Full Reset
			</Button>

			<Text
				size="13"
				weight="500"
				color="support"
				height="16"
				align="center"
				>Note that a full reset causes you to log out of your account,
				reset all settings, delete your presets, and delete other local
				data within your browser</Text
			>
		</Flex>
	</Flex>
</template>

<style module></style>
