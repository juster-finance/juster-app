<script setup>
/**
 * UI
 */
import Toggle from "@ui/Toggle.vue"
</script>

<template>
	<Flex direction="column" gap="24">
		<Flex direction="column" gap="8">
			<Text size="13" weight="600" color="primary">Sound effects</Text>

			<Flex gap="12" :class="$style.badge">
				<Icon name="event_new" size="14" color="tertiary" />

				<Flex direction="column" gap="8">
					<Text size="14" weight="600" color="primary">
						Disabled
					</Text>
					<Text size="13" weight="500" color="tertiary">
						Complete sound mute
					</Text>
				</Flex>
			</Flex>
			<Flex gap="12" :class="$style.badge">
				<Icon name="event_new" size="14" color="tertiary" />

				<Flex direction="column" gap="8">
					<Text size="14" weight="600" color="primary">
						Notifications
					</Text>
					<Text size="13" weight="500" color="tertiary">
						Only for pop-up notifications
					</Text>
				</Flex>
			</Flex>
			<Flex gap="12" :class="$style.badge">
				<Icon name="event_new" size="14" color="tertiary" />

				<Flex direction="column" gap="8">
					<Text size="14" weight="600" color="primary">
						Fully Enabled
					</Text>
					<Text size="13" weight="500" color="tertiary">
						Sounds for all important things and actions
					</Text>
				</Flex>
			</Flex>

			<Text size="13" weight="500" color="support" height="16">
				Use sound to confirm operations, at the end of events, etc
			</Text>
		</Flex>

		<Flex justify="between" gap="24">
			<Flex direction="column" gap="6">
				<Text size="13" weight="600" color="primary"
					>Reduced motion</Text
				>
				<Text size="13" weight="500" color="tertiary" height="16">
					Disabling animations and animated transitions between pages
				</Text>
			</Flex>

			<Toggle />
		</Flex>
	</Flex>
</template>

<style module>
.badge {
	cursor: pointer;
	background: rgba(255, 255, 255, 0.05);
	border-radius: 6px;

	opacity: 0.4;
	pointer-events: none;

	padding: 12px;
}
</style>
