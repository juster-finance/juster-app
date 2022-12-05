<script setup>
/**
 * UI
 */
import Toggle from "@ui/Toggle.vue"
</script>

<template>
	<!-- Hide events with suspicious target dynamics -->
	<Flex justify="between" gap="24">
		<Flex direction="column" gap="8">
			<Text size="13" weight="600" color="primary">
				Hide events with suspicious target dynamics
			</Text>
			<Text size="13" weight="500" color="tertiary" height="16">
				The customization of the target dynamics can affect the
				correctness of the calculation for outcome of the event
				<Text color="support" height="16"
					>Do not disable this option unless strictly necessary</Text
				>
			</Text>
		</Flex>

		<Toggle />
	</Flex>
</template>

<style module></style>
