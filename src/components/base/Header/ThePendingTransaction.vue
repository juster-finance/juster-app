<script setup>
/**
 * Vendor
 */
import { onBeforeUnmount, onMounted, ref } from "vue"

/**
 * UI
 */
import Spin from "@ui/Spin.vue"
import Tooltip from "@ui/Tooltip.vue"

let timerInterval = null
const timer = ref(0)

onMounted(() => {
	timerInterval = setInterval(() => {
		timer.value += 1
	}, 1000)
})

onBeforeUnmount(() => {
	clearInterval(timerInterval)
})
</script>

<template>
	<div :class="$style.wrapper">
		<Flex align="center" justify="between" :class="$style.base">
			<Tooltip placement="right">
				<Flex align="center" gap="8">
					<Text size="13" height="11" weight="600" color="secondary">
						Pending operation
					</Text>

					<Icon name="help" size="14" color="tertiary" />
				</Flex>

				<template #content
					>Wait for the completion of the sent transaction to
					continue</template
				>
			</Tooltip>

			<Flex align="center" justify="center" gap="8">
				<Flex align="center">
					<Text size="12" weight="600" color="secondary">{{
						timer
					}}</Text>
					<Text size="12" weight="600" color="tertiary">s</Text>
				</Flex>

				<Spin size="14" />
			</Flex>
		</Flex>
	</div>
</template>

<style module>
.wrapper {
	display: flex;
	justify-content: center;

	position: sticky;
	top: 80px;
	z-index: 1;
	backdrop-filter: blur(5px);

	border-bottom: 1px solid var(--border);
}

.base {
	width: 100%;
	max-width: 1250px;
	margin: 0 32px;
	height: 48px;
}

@media (max-width: 700px) {
	.base {
		margin: 0 24px;
	}
}
</style>
