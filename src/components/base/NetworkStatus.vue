<script setup>
/**
 * Store
 */
import { useAppStore } from "@store/app"

const appStore = useAppStore()

const handleForceClose = () => {
	appStore.isOnline = true
}
</script>

<template>
	<transition name="fade">
		<Flex v-if="!appStore.isOnline" :class="$style.wrapper" align="center" gap="24">
			<Flex align="center" gap="16" :class="$style.content">
				<Icon name="wifi_off" size="20" color="red" />

				<Flex direction="column" gap="8">
					<Text size="13" weight="600" color="secondary">It looks like you are offline</Text>
					<Text size="13" weight="500" color="tertiary" :class="$style.description"> Check your network connection </Text>
				</Flex>
			</Flex>

			<Icon @click="handleForceClose" name="close" size="16" color="tertiary" :class="$style.close_btn" />
		</Flex>
	</transition>
</template>

<style module>
.wrapper {
	position: fixed;
	bottom: 24px;
	left: 50%;
	z-index: 2000;

	transform: translateX(-50%);

	border-radius: 12px;
	background: var(--card-bg);
	border: 1px solid var(--border);
	box-shadow: rgb(0 0 0 / 20%) 0px 4px 24px;

	padding: 12px 16px;
}

.close_btn {
	cursor: pointer;
	padding: 4px;
	box-sizing: content-box;

	transition: all 0.2s ease;
}

.close_btn:hover {
	fill: var(--text-secondary);
}

.close_btn:active {
	transform: translateY(1px);
}

@media (max-width: 700px) {
	.wrapper {
		left: 16px;
		right: 16px;
		transform: initial;

		justify-content: space-between;
	}
}

@media (max-width: 500px) {
	.content {
		flex-direction: column;
		align-items: flex-start;
	}

	.description {
		line-height: 1.6;
	}
}
</style>
