<script setup>
/**
 * Vendor
 */
import { ref, reactive, computed } from "vue"

/**
 * UI
 */
import Button from "@ui/Button.vue"

const props = defineProps({
	entries: Array,
})

const tabs = reactive([
	{
		icon: "splitted_chart",
		title: "TVL",
	},
	{
		icon: "splitted_chart",
		title: "APY",
	},
	{
		icon: "money",
		title: "Profit",
	},
])
const selectedTab = ref(tabs[0].title)

const valueLocked = computed(() =>
	props.entries.reduce((acc, curr) => (acc += curr.amount), 0),
)

const poolsDistribution = computed(() => {
	const distribution = []

	props.entries.forEach((entry) => {
		if (!distribution.length) {
			distribution.push({
				name: entry.pool.name,
				tvl: entry.amount,
			})
		} else {
			const pool = distribution.find((e) => e.name === entry.pool.name)

			if (pool) {
				pool.tvl += entry.amount
			} else {
				distribution.push({
					name: entry.pool.name,
					tvl: entry.amount,
				})
			}
		}
	})

	return distribution.sort((a, b) => b.tvl - a.tvl)
})
</script>

<template>
	<div :class="$style.wrapper">
		<Flex direction="column" gap="8" :class="$style.head">
			<Text color="primary" size="16" weight="600">My Statistics</Text>
			<Text color="tertiary" size="14" weight="500" height="14"
				>Splitted data by pools</Text
			>
		</Flex>

		<Flex direction="column" gap="24">
			<Flex direction="column" gap="8">
				<Flex align="center" justify="between">
					<Text color="secondary" size="13" weight="600">
						Total Value Locked
					</Text>

					<Text color="secondary" size="13" weight="600">
						{{ valueLocked }}
					</Text>
				</Flex>

				<div :class="$style.bar">
					<div v-if="valueLocked" :class="$style.bar_progress" />
				</div>

				<!-- Hint for empty state -->
				<Text
					v-if="!valueLocked"
					size="12"
					color="support"
					weight="500"
					height="16"
				>
					After the first deposits here you will see what pools were
					provided with liquidity and in what amount
				</Text>
			</Flex>

			<template v-if="valueLocked">
				<Flex
					v-for="pool in poolsDistribution"
					direction="column"
					gap="8"
				>
					<Flex align="center" justify="between">
						<Text color="secondary" size="13" weight="600">
							{{ pool.name.replace("Juster Pool: ", "") }}
						</Text>

						<Flex align="center" gap="8">
							<Text color="tertiary" size="13" weight="600">
								{{ pool.tvl }}
							</Text>

							<Text color="secondary" size="13" weight="600">
								{{
									((pool.tvl * 100) / valueLocked).toFixed(0)
								}}%
							</Text>
						</Flex>
					</Flex>

					<div :class="$style.bar">
						<div
							:style="{
								width: `${(pool.tvl * 100) / valueLocked}%`,
							}"
							:class="$style.bar_progress"
						/>
					</div>
				</Flex>
			</template>
		</Flex>

		<Flex align="center" gap="6" :class="$style.tabs">
			<Flex
				v-for="(tab, i) in tabs"
				:key="i"
				@click="selectedTab = tab.title"
				align="center"
				gap="8"
				:class="[
					$style.tab,
					selectedTab === tab.title && $style.active,
				]"
			>
				<Icon :name="tab.icon" size="14" color="tertiary" />
				<Text size="14" weight="600">{{ tab.title }}</Text>
			</Flex>
		</Flex>
	</div>
</template>

<style module>
.wrapper {
	width: 100%;
	border-radius: 10px;

	background: var(--card-bg);

	padding: 24px;
}

.head {
	border-bottom: 1px solid var(--border);

	padding-bottom: 20px;
	margin-bottom: 24px;
}

.bar {
	width: 100%;
	height: 12px;
	border-radius: 3px;
	background: rgba(255, 255, 255, 0.05);

	overflow: hidden;
}

.bar_progress {
	width: 100%;
	height: 100%;
	background: var(--blue);

	transition: width 1s ease;
}

.tabs {
	border-top: 1px solid var(--border);

	padding-top: 20px;
	margin-top: 24px;
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
</style>
