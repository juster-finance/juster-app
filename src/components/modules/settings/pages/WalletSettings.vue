<script setup>
/**
 * UI
 */
import Button from "@ui/Button.vue"
</script>

<template>
	<Flex direction="column" gap="16">
		<Button type="secondary" size="medium">
			<Icon name="arrows" size="16" color="secondary" />
			Switch Account
		</Button>

		<Button type="secondary" size="medium">
			<Icon name="settings" size="16" color="secondary" />
			Custom Authorization
		</Button>

		<Button type="secondary" size="medium">
			<Icon name="logout" size="16" color="secondary" />
			Logout
		</Button>
	</Flex>
</template>

<style module></style>
