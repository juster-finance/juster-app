<script setup>
/**
 * UI
 */
import Button from "@ui/Button.vue"
</script>

<template>
	<Flex direction="column" gap="16">
		<Button type="secondary" size="medium">
			<Icon name="settings" size="16" color="secondary" />
			Enable account debugging
		</Button>

		<Button type="secondary" size="medium">
			<Icon name="settings" size="16" color="secondary" />
			Enable history debugging
		</Button>

		<Button type="secondary" size="medium">
			<Icon name="settings" size="16" color="secondary" />
			Enable analytics debugging
		</Button>

		<Button type="secondary" size="medium">
			<Icon name="settings" size="16" color="secondary" />
			Enable animation debugging
		</Button>

		<Flex align="center" gap="8" wide>
			<Button type="secondary" size="medium" block>
				<Icon name="share" size="16" color="secondary" />
				Export settings
			</Button>
			<Button type="secondary" size="medium" block>
				<Icon name="import" size="16" color="secondary" />
				Import settings
			</Button>
		</Flex>
	</Flex>
</template>

<style module></style>
