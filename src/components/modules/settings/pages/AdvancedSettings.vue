<script setup>
/**
 * Vendor
 */
import { ref } from "vue"

/**
 * UI
 */
import Toggle from "@ui/Toggle.vue"

/**
 * Store
 */
import { useAppStore } from "@store/app"

const appStore = useAppStore()

const useProMode = ref(false)

const useHideSusTargetDynamics = ref(true)

const handleProtection = (target) => {
	if (target === "susTargetDynamics") {
		if (!useHideSusTargetDynamics.value) {
			useHideSusTargetDynamics.value = true
			return
		}

		appStore.confirmation.title =
			"Are you sure you want to disable this setting?"
		appStore.confirmation.description =
			"Disabling this setting will result in the display of events with suspicious target dynamics"

		appStore.confirmation.metadata.buttons.confirm.title = "Disable"
		appStore.confirmation.metadata.buttons.confirm.icon = "check"
		appStore.confirmation.metadata.buttons.confirm.type = "secondary"
		appStore.confirmation.metadata.buttons.cancel.title =
			"Keep it turned on"
		appStore.confirmation.metadata.buttons.cancel.icon = "flip_back"

		appStore.confirmation.badges = [
			{
				icon: {
					name: "warning",
					color: "orange",
				},
				name: "Custom target dynamics can affect the outcome of an event",
			},
			{
				icon: {
					name: "warning",
					color: "orange",
				},
				name: "You may sustain a loss without noticing the problem",
			},
			{
				icon: {
					name: "checkcircle",
					color: "green",
				},
				name: "Events with custom target dynamics are marked",
			},
		]

		appStore.confirmation.show = true

		appStore.confirmation.cancelCb = () => {
			useHideSusTargetDynamics.value = true
			appStore.confirmation.show = false
		}
		appStore.confirmation.confirmCb = () => {
			useHideSusTargetDynamics.value = false
			appStore.confirmation.show = false
		}
	}
}
</script>

<template>
	<Flex direction="column" gap="24">
		<Flex justify="between" gap="24">
			<Flex direction="column" gap="6">
				<Text size="13" weight="600" color="primary">Pro Mode</Text>
				<Text size="13" weight="500" color="tertiary" height="16">
					Access to additional functionality if you are an advanced
					user
				</Text>
			</Flex>

			<Toggle v-model="useProMode" />
		</Flex>

		<Flex justify="between" gap="24">
			<Flex direction="column" gap="6">
				<Text size="13" weight="600" color="primary"
					>Feature Preview</Text
				>
				<Text size="13" weight="500" color="tertiary" height="16">
					Get access to early testing of new features at your own risk
				</Text>
			</Flex>

			<Toggle />
		</Flex>

		<Flex justify="between" gap="24">
			<Flex direction="column" gap="6">
				<Text size="13" weight="600" color="primary"
					>Simple Analytics</Text
				>
				<Text size="13" weight="500" color="tertiary" height="16">
					This feature allows us to make the application better
				</Text>
			</Flex>

			<Toggle />
		</Flex>

		<Flex justify="between" gap="24">
			<Flex direction="column" gap="6">
				<Text size="13" weight="600" color="primary"
					>Developer Mode</Text
				>
				<Text size="13" weight="500" color="tertiary" height="16">
					Get access to advanced features for debugging this
					application
				</Text>
			</Flex>

			<Toggle />
		</Flex>

		<!-- Pro Mode Settings -->
		<template v-if="useProMode">
			<div :class="$style.divider" />

			<!-- Hide events with suspicious target dynamics -->
			<Flex justify="between" gap="24">
				<Flex direction="column" gap="8">
					<Text size="13" weight="600" color="primary">
						Hide events with suspicious target dynamics
					</Text>
					<Text size="13" weight="500" color="tertiary" height="16">
						The customization of the target dynamics can affect the
						correctness of the calculation for outcome of the event
					</Text>
				</Flex>

				<Toggle
					v-model="useHideSusTargetDynamics"
					:protected="true"
					@click="handleProtection('susTargetDynamics')"
				/>
			</Flex>
		</template>
	</Flex>
</template>

<style module>
.divider {
	width: 100%;
	height: 1px;
	background: var(--border);
}
</style>
