<script setup>
/**
 * Vendor
 */
import { ref } from "vue"

/**
 * UI
 */
import Toggle from "@ui/Toggle.vue"

const selectedTheme = ref("Dark")
</script>

<template>
	<Flex direction="column" gap="40">
		<Flex direction="column" gap="16" wide>
			<Text size="13" weight="600" color="primary">Interface Theme</Text>

			<Flex justify="between" wide>
				<Flex
					@click="selectedTheme = 'Dark'"
					direction="column"
					gap="12"
				>
					<Flex
						align="end"
						justify="center"
						:class="[$style.theme_card, $style.dark, $style.active]"
					>
						<svg
							width="104"
							height="80"
							viewBox="0 0 104 80"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M0 16C0 14.8954 0.895431 14 2 14H102C103.105 14 104 14.8954 104 16V80H0V16Z"
								fill="#252528"
							/>
							<path
								d="M0 8C0 3.58172 3.58172 0 8 0H96C100.418 0 104 3.58172 104 8V8C104 9.10457 103.105 10 102 10H2C0.895432 10 0 9.10457 0 8V8Z"
								fill="#252528"
							/>
							<circle
								cx="9"
								cy="23"
								r="3"
								fill="white"
								fill-opacity="0.1"
							/>
							<circle
								cx="9"
								cy="39"
								r="3"
								fill="white"
								fill-opacity="0.1"
							/>
							<circle
								cx="9"
								cy="55"
								r="3"
								fill="white"
								fill-opacity="0.1"
							/>
							<circle
								cx="9"
								cy="71"
								r="3"
								fill="white"
								fill-opacity="0.1"
							/>
							<rect
								x="18"
								y="21"
								width="40"
								height="4"
								rx="2"
								fill="white"
								fill-opacity="0.1"
							/>
							<rect
								x="18"
								y="37"
								width="40"
								height="4"
								rx="2"
								fill="white"
								fill-opacity="0.1"
							/>
							<rect
								x="18"
								y="53"
								width="40"
								height="4"
								rx="2"
								fill="white"
								fill-opacity="0.1"
							/>
							<rect
								x="18"
								y="69"
								width="40"
								height="4"
								rx="2"
								fill="white"
								fill-opacity="0.1"
							/>
						</svg>
					</Flex>

					<Flex alig="center" gap="8">
						<Text
							size="13"
							weight="600"
							color="primary"
							height="11"
						>
							Dark
						</Text>
						<Icon
							v-if="selectedTheme === 'Dark'"
							name="check"
							size="16"
							color="blue"
						/>
					</Flex>
				</Flex>
				<Flex
					@click="selectedTheme = 'Light'"
					direction="column"
					gap="12"
				>
					<Flex
						align="end"
						justify="center"
						:class="[$style.theme_card, $style.light]"
					>
						<svg
							width="104"
							height="80"
							viewBox="0 0 104 80"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M0 16C0 14.8954 0.895431 14 2 14H102C103.105 14 104 14.8954 104 16V80H0V16Z"
								fill="white"
								fill-opacity="0.95"
							/>
							<path
								d="M0 8C0 3.58172 3.58172 0 8 0H96C100.418 0 104 3.58172 104 8C104 9.10457 103.105 10 102 10H2C0.895432 10 0 9.10457 0 8Z"
								fill="white"
								fill-opacity="0.95"
							/>
							<circle
								cx="9"
								cy="23"
								r="3"
								fill="black"
								fill-opacity="0.1"
							/>
							<circle
								cx="9"
								cy="39"
								r="3"
								fill="black"
								fill-opacity="0.1"
							/>
							<circle
								cx="9"
								cy="55"
								r="3"
								fill="black"
								fill-opacity="0.1"
							/>
							<circle
								cx="9"
								cy="71"
								r="3"
								fill="black"
								fill-opacity="0.1"
							/>
							<rect
								x="18"
								y="21"
								width="40"
								height="4"
								rx="2"
								fill="black"
								fill-opacity="0.1"
							/>
							<rect
								x="18"
								y="37"
								width="40"
								height="4"
								rx="2"
								fill="black"
								fill-opacity="0.1"
							/>
							<rect
								x="18"
								y="53"
								width="40"
								height="4"
								rx="2"
								fill="black"
								fill-opacity="0.1"
							/>
							<rect
								x="18"
								y="69"
								width="40"
								height="4"
								rx="2"
								fill="black"
								fill-opacity="0.1"
							/>
						</svg>
					</Flex>

					<Flex alig="center" gap="8">
						<Text
							size="13"
							weight="600"
							color="primary"
							height="11"
						>
							Light
						</Text>
						<Icon
							v-if="selectedTheme === 'Light'"
							name="check"
							size="16"
							color="blue"
						/>
					</Flex>
				</Flex>
				<Flex
					@click="selectedTheme = 'Midnight'"
					direction="column"
					gap="12"
				>
					<Flex
						align="end"
						justify="center"
						:class="[$style.theme_card, $style.midnight]"
					>
						<svg
							width="104"
							height="80"
							viewBox="0 0 104 80"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M0 16C0 14.8954 0.895431 14 2 14H102C103.105 14 104 14.8954 104 16V80H0V16Z"
								fill="#171717"
							/>
							<path
								d="M0.5 16C0.5 15.1716 1.17157 14.5 2 14.5H102C102.828 14.5 103.5 15.1716 103.5 16V79.5H0.5V16Z"
								stroke="white"
								stroke-opacity="0.1"
							/>
							<path
								d="M0 8C0 3.58172 3.58172 0 8 0H96C100.418 0 104 3.58172 104 8C104 9.10457 103.105 10 102 10H2C0.895432 10 0 9.10457 0 8Z"
								fill="#171717"
							/>
							<path
								d="M0.5 8C0.5 3.85786 3.85786 0.5 8 0.5H96C100.142 0.5 103.5 3.85786 103.5 8C103.5 8.82843 102.828 9.5 102 9.5H2C1.17157 9.5 0.5 8.82843 0.5 8Z"
								stroke="white"
								stroke-opacity="0.1"
							/>
							<circle
								cx="9"
								cy="23"
								r="3"
								fill="white"
								fill-opacity="0.1"
							/>
							<circle
								cx="9"
								cy="39"
								r="3"
								fill="white"
								fill-opacity="0.1"
							/>
							<circle
								cx="9"
								cy="55"
								r="3"
								fill="white"
								fill-opacity="0.1"
							/>
							<circle
								cx="9"
								cy="71"
								r="3"
								fill="white"
								fill-opacity="0.1"
							/>
							<rect
								x="18"
								y="21"
								width="40"
								height="4"
								rx="2"
								fill="white"
								fill-opacity="0.1"
							/>
							<rect
								x="18"
								y="37"
								width="40"
								height="4"
								rx="2"
								fill="white"
								fill-opacity="0.1"
							/>
							<rect
								x="18"
								y="53"
								width="40"
								height="4"
								rx="2"
								fill="white"
								fill-opacity="0.1"
							/>
							<rect
								x="18"
								y="69"
								width="40"
								height="4"
								rx="2"
								fill="white"
								fill-opacity="0.1"
							/>
						</svg>
					</Flex>

					<Flex alig="center" gap="8">
						<Text
							size="13"
							weight="600"
							color="primary"
							height="11"
						>
							Midnight
						</Text>
						<Icon
							v-if="selectedTheme === 'Midnight'"
							name="check"
							size="16"
							color="blue"
						/>
					</Flex>
				</Flex>
			</Flex>
		</Flex>

		<Flex justify="between" gap="24">
			<Flex direction="column" gap="6">
				<Text size="13" weight="600" color="primary">
					System settings in priority
				</Text>
				<Text size="13" weight="500" color="tertiary" height="16">
					Auto theme selection depending on your OS settings
				</Text>
			</Flex>

			<Toggle />
		</Flex>
	</Flex>
</template>

<style module>
.theme_card {
	width: 140px;
	height: 100px;

	border-radius: 12px;
	cursor: pointer;
}

.theme_card svg {
	transition: all 0.2s ease;
}

.theme_card:hover svg {
	transform: scale(1.02);
}

.theme_card.dark {
	background: var(--app-bg);
	border: 2px solid var(--border);
}

.theme_card.light {
	background: #e3e3e3;
	border: 2px solid rgba(0, 0, 0, 0.3);
}

.theme_card.midnight {
	background: #1b1b1b;
	border: 2px solid var(--border);
}
</style>
