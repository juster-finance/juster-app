<script setup>
/**
 * UI
 */
import Button from "@ui/Button.vue"
import {
	Dropdown,
	DropdownItem,
	DropdownTitle,
	DropdownDivider,
} from "@ui/Dropdown"

const props = defineProps({
	pool: Object,
})
</script>

<template>
	<Flex direction="column" gap="24">
		<Flex align="center" justify="between">
			<Flex direction="column" gap="8">
				<Flex align="center" gap="4">
					<Text size="13" weight="600" color="secondary">
						Temporarily unaudited level of security
					</Text>
					<Icon name="warning" size="12" color="brand" />
				</Flex>
				<Text size="12" weight="600" color="tertiary">
					Smart Contract&nbsp; •&nbsp; Liquidity Pools
				</Text>
			</Flex>

			<Flex gap="8">
				<a href="https://tzkt.io/" target="_blank">
					<Button type="secondary" size="small">
						<Icon name="database" size="12" />
					</Button>
				</a>

				<Dropdown side="top">
					<template #trigger>
						<Button type="secondary" size="small">
							<Icon name="dots" size="12" />
						</Button>
					</template>

					<template #dropdown>
						<DropdownItem disabled>
							<Icon name="notifications" size="16" />Setup
							Notifications
						</DropdownItem>

						<DropdownDivider />

						<DropdownTitle>Timeline</DropdownTitle>
						<DropdownItem>
							<Icon name="time" size="16" />
							My history
						</DropdownItem>
						<DropdownItem>
							<Icon name="time" size="16" />
							Pools history
						</DropdownItem>

						<DropdownDivider />

						<DropdownTitle>Raw Data</DropdownTitle>
						<DropdownItem>
							<Icon name="table" size="16" /> Pools
						</DropdownItem>
						<DropdownItem>
							<Icon name="table" size="16" /> My Positions
						</DropdownItem>
						<DropdownItem>
							<Icon name="table" size="16" /> My Claims
						</DropdownItem>

						<DropdownDivider />

						<DropdownTitle>Copy</DropdownTitle>
						<DropdownItem>
							<Icon name="copy" size="16" />
							Contract address
						</DropdownItem>
					</template>
				</Dropdown>
			</Flex>
		</Flex>

		<svg
			width="100%"
			height="5"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<defs>
				<pattern
					id="bg"
					patternUnits="userSpaceOnUse"
					width="85"
					height="24"
				>
					<path
						d="M79.7303 2.89852C81 1.89856 82.2697 1.00012 84.7059 1.00012V0.00012207C81.8479 0.00012207 80.4706 1.10172 79.0933 2.10172C77.8235 3.10168 76.5538 4.00012 74.1176 4.00012C71.6815 4.00012 70.4118 3.10172 69.142 2.10172C67.7647 1.10172 66.3874 0.00012207 63.5294 0.00012207C60.6714 0.00012207 59.2941 1.10172 57.9168 2.10172C56.6471 3.10168 55.3773 4.00012 52.9412 4.00012C50.505 4.00012 49.2353 3.10172 47.9656 2.10172C46.5882 1.10172 45.2109 0.00012207 42.3529 0.00012207C39.495 0.00012207 38.1176 1.10172 36.7403 2.10172C35.4706 3.10168 34.2008 4.00012 31.7647 4.00012C29.3286 4.00012 28.0588 3.10172 26.7891 2.10172C25.4118 1.10172 24.0344 0.00012207 21.1765 0.00012207C18.3185 0.00012207 16.9412 1.10172 15.5639 2.10172C14.2941 3.10168 13.0244 4.00012 10.5882 4.00012C8.15209 4.00012 6.88235 3.10172 5.61261 2.10172C4.23529 1.10172 2.85798 0.00012207 0 0.00012207V1.00012C2.43614 1.00012 3.70588 1.89852 4.97562 2.89852C6.35294 3.89852 7.73026 5.00012 10.5882 5.00012C13.4462 5.00012 14.8235 3.89852 16.2008 2.89852C17.4706 1.89856 18.7403 1.00012 21.1765 1.00012C23.6126 1.00012 24.8824 1.89852 26.1521 2.89852C27.5294 3.89852 28.9067 5.00012 31.7647 5.00012C34.6227 5.00012 36 3.89852 37.3773 2.89852C38.6471 1.89856 39.9168 1.00012 42.3529 1.00012C44.7891 1.00012 46.0588 1.89852 47.3286 2.89852C48.7059 3.89852 50.0832 5.00012 52.9412 5.00012C55.7991 5.00012 57.1765 3.89852 58.5538 2.89852C59.8235 1.89856 61.0933 1.00012 63.5294 1.00012C65.9655 1.00012 67.2353 1.89852 68.505 2.89852C69.8824 3.89852 71.2597 5.00012 74.1176 5.00012C76.9756 5.00012 78.3529 3.89852 79.7303 2.89852Z"
						fill="white"
						fill-opacity="0.1"
					/>
				</pattern>
			</defs>
			<rect width="100%" height="100%" fill="url(#bg)" />
		</svg>

		<Flex align="center" :class="$style.labels">
			<Text size="13" weight="500" color="support" :class="$style.label">
				<span>~30%</span>&nbsp;APY
			</Text>
			<Text size="13" weight="500" color="support" :class="$style.label">
				Minimum&nbsp;<span>0.01 ꜩ</span>
			</Text>
			<Text size="13" weight="500" color="support" :class="$style.label">
				Version&nbsp;<span>{{ pool.version }}</span>
			</Text>
		</Flex>

		<Text
			size="12"
			weight="500"
			color="support"
			height="16"
			:class="$style.hint"
		>
			Before interacting with the liquidity pool, read
			<a href="/docs" target="_blank">our guide</a>. Pools do not
			guarantee a stable yield and accurate rates of return.
		</Text>
	</Flex>
</template>

<style module>
.labels {
	width: 100%;
	height: 44px;

	border: 2px solid rgba(255, 255, 255, 0.05);
	border-radius: 8px;
}

.label {
	width: 100%;
	height: 100%;

	display: flex;
	align-items: center;
	justify-content: center;
}

.label:nth-child(1) {
	border-right: 2px solid rgba(255, 255, 255, 0.05);
}

.label:nth-child(2) {
	border-right: 2px solid rgba(255, 255, 255, 0.05);
}

.label span {
	color: var(--text-tertiary);
}

.hint a {
	color: var(--text-tertiary);
}
</style>
