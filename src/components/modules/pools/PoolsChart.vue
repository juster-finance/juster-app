<template>
	<Flex direction="column" gap="24" :class="$style.wrapper">
		<Flex justify="between" wide>
			<Flex direction="column" gap="8">
				<Text size="16" weight="600" color="primary">
					Pools Chart
				</Text>
				<Text size="14" weight="500" height="14" color="tertiary">
					Aggregated visualization of pools
				</Text>
			</Flex>

			<Flex align="center" gap="8" :class="$style.filter_btn">
				<Flex>
					<Text size="13" weight="600" color="tertiary">
						Pools:&nbsp;
					</Text>
					<Text size="13" weight="600" color="primary">All</Text>
				</Flex>

				<Icon name="arrow" size="14" color="tertiary" />
			</Flex>
		</Flex>

		<div :class="$style.chart" />

		<Flex align="end" justify="between">
			<Flex align="center" gap="6">
				<Flex
					align="center"
					gap="8"
					:class="[$style.tab, $style.active]"
				>
					<Icon name="coins" size="14" color="tertiary" />
					<Text size="14" weight="600">Locked Amount</Text>
				</Flex>

				<Flex align="center" gap="8" :class="$style.tab">
					<Icon name="banknote" size="14" color="tertiary" />
					<Text size="14" weight="600">Share Price</Text>
				</Flex>
			</Flex>

			<Flex align="center" gap="6">
				<div :class="$style.dot" />
				<Text size="12" weight="600" color="secondary">All Pools</Text>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	border-radius: 10px;
	background: var(--card-bg);

	padding: 24px;
}

.filter_btn {
	cursor: pointer;

	height: fit-content;
}

.chart {
	height: 240px;
}

.tab {
	height: 32px;
	border-radius: 6px;
	cursor: pointer;

	color: var(--text-secondary);

	padding: 0 12px;

	transition: color 0.2s ease, background 0.2s ease;
}

.tab:hover {
	color: var(--text-primary);
}

.tab.active {
	background: rgba(255, 255, 255, 0.05);
	color: var(--text-primary);
}

.dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: var(--blue);
}
</style>
