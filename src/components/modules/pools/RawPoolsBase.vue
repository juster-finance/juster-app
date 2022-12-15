<script setup>
/**
 * Vendor
 */
import { ref, onMounted, onUnmounted, computed, watch } from "vue"
import { useMeta } from "vue-meta"
import { DateTime } from "luxon"

/**
 * UI
 */
import Button from "@ui/Button.vue"
import Checkbox from "@ui/Checkbox.vue"

/**
 * Services
 */
import { juster } from "@sdk"

/**
 * Models
 */
import { poolState as poolStateModel } from "@/graphql/models"

/**
 * Store
 */
import { useMarketStore } from "@store/market"

const marketStore = useMarketStore()

/**
 * Pools
 */
const pools = computed(() => marketStore.pools)
const subStates = ref({})
const poolsStates = ref({})

const populatePools = async () => {
	for (const index in pools.value) {
		if (!Object.hasOwnProperty.call(pools.value, index)) return
		const pool = pools.value[index]

		poolsStates.value[pool.address] = await juster.pools[
			pool.address
		].getLastPoolState()
	}

	setupSubToStates()
}

const setupSubToStates = async () => {
	subStates.value = await juster.gql
		.subscription({
			poolState: [
				{
					where: {
						pool: {
							address: {
								_in: pools.value.map((pool) => pool.address),
							},
						},
					},
					limit: 1,
					order_by: [{ timestamp: "desc" }],
				},
				poolStateModel,
			],
		})
		.subscribe({
			next: ({ poolState }) => {
				const newPoolState = poolState[0]
				const currentPoolState = poolsStates.value[newPoolState.poolId]

				if (newPoolState.counter === currentPoolState.counter) return

				if (newPoolState.counter > currentPoolState.counter) {
					poolsStates.value[newPoolState.poolId] = newPoolState
				}
			},
			error: console.error,
		})
}

const showAnimation = ref(false)
onMounted(() => {
	showAnimation.value = true

	if (Object.keys(juster.pools).length) {
		populatePools()
	}
})

onUnmounted(() => {
	if (
		Object.prototype.hasOwnProperty.call(subStates.value, "_state") &&
		!subStates.value?.closed
	) {
		subStates.value.unsubscribe()
	}
})

watch(
	() => juster.pools,
	() => {
		populatePools()
	},
	{
		deep: true,
	},
)

/** Meta */
const { meta } = useMeta({
	title: `Raw Pools`,
	description: "Liquidity Pools Managemenet",
})
</script>

<template>
	<transition name="slide">
		<div v-if="showAnimation">
			<metainfo>
				<template v-slot:title="{ content }"
					>{{ content }} • Juster</template
				>
			</metainfo>

			<Flex align="center" gap="8" :class="$style.head">
				<Text size="16" weight="600" color="tertiary">
					<router-link to="/pools" :class="$style.link"
						>Liquidity Pools</router-link
					>
				</Text>

				<Icon
					name="arrow"
					size="16"
					color="tertiary"
					style="rotate: -90deg"
				/>

				<Text size="16" weight="600" color="primary"> Raw Pools </Text>
			</Flex>

			<Flex direction="column" gap="20" :class="$style.content">
				<Flex align="center" gap="8">
					<Button type="white" size="small">
						<Icon name="export" size="16" /> Export
					</Button>
					<Button type="secondary" size="small">
						<Icon name="filter" size="16" />
					</Button>
					<Button type="secondary" size="small">
						<Icon name="search" size="16" />
					</Button>
				</Flex>

				<table :class="$style.table">
					<thead>
						<tr>
							<td :class="$style.w">
								<Checkbox />
							</td>
							<td>
								<Text
									size="11"
									color="tertiary"
									weight="700"
									style="line-height: 14px"
								>
									NAME
								</Text>
							</td>
							<td>
								<Text
									size="11"
									color="tertiary"
									weight="700"
									style="line-height: 14px"
								>
									STATUS
								</Text>
							</td>
							<td>
								<Text
									size="11"
									color="tertiary"
									weight="700"
									style="line-height: 14px"
								>
									ADDRESS
								</Text>
							</td>
							<td>
								<Text
									size="11"
									color="tertiary"
									weight="700"
									style="line-height: 14px"
								>
									SHARE PRICE
								</Text>
							</td>
							<td>
								<Text
									size="11"
									color="tertiary"
									weight="700"
									style="line-height: 14px"
								>
									LIQUIDITY
								</Text>
							</td>
							<td>
								<Text
									size="11"
									color="tertiary"
									weight="700"
									style="line-height: 14px"
								>
									LAST ACTION
								</Text>
							</td>
						</tr>
					</thead>

					<tbody>
						<tr v-for="pool in pools">
							<td :class="$style.w">
								<Checkbox />
							</td>
							<td>
								<Text size="14" weight="600" color="secondary">
									{{ pool.name.replace("Juster Pool: ", "") }}
								</Text>
							</td>
							<td>
								<Flex align="center" gap="4">
									<Icon
										:name="
											!pool.isDepositPaused
												? 'zap_circle'
												: 'pause'
										"
										size="12"
										:color="
											!pool.isDepositPaused
												? 'green'
												: 'yellow'
										"
									/>
									<Text
										size="12"
										weight="600"
										:color="
											!pool.isDepositPaused
												? 'green'
												: 'yellow'
										"
									>
										{{
											!pool.isDepositPaused
												? "Active"
												: "Paused"
										}}
									</Text>
								</Flex>
							</td>
							<td>
								<Text size="14" weight="600" color="secondary">
									{{ pool.address }}
								</Text>
							</td>
							<td>
								<Text
									v-if="poolsStates[pool.address]"
									size="14"
									weight="600"
									color="secondary"
								>
									{{
										poolsStates[
											pool.address
										]?.sharePrice.toFixed(2)
									}}
								</Text>
							</td>
							<td>
								<Text
									v-if="poolsStates[pool.address]"
									size="14"
									weight="600"
									color="secondary"
								>
									{{
										poolsStates[
											pool.address
										]?.totalLiquidity.toFixed(2)
									}}
								</Text>
							</td>
							<td :class="$style.w">
								<Flex
									v-if="poolsStates[pool.address]"
									align="center"
								>
									<Text
										size="14"
										weight="600"
										color="secondary"
										no-wrap
									>
										{{
											DateTime.fromJSDate(
												poolsStates[pool.address]
													?.timestamp,
											).toFormat("LLL dd, t")
										}}
									</Text>
									&nbsp;
									<Text
										size="12"
										weight="600"
										color="support"
									>
										({{
											poolsStates[pool.address]?.action
										}})
									</Text>
								</Flex>
							</td>
						</tr>
					</tbody>
				</table>
			</Flex>
		</div>
	</transition>
</template>

<style module>
.head {
	border-bottom: 1px solid var(--border);

	padding-bottom: 16px;
	margin-bottom: 24px;
}

.link {
	transition: color 0.2s ease;
}

.link:hover {
	color: var(--text-primary);
}

.link:focus {
	box-shadow: 0 0 0 transparent;
	color: var(--text-primary);
}

.table {
	border-spacing: 0;
}

.table thead td {
	height: 36px;
	border-bottom: 1px solid var(--border);

	padding: 0 8px;
}

.table tbody td {
	height: 36px;
	border-bottom: 1px solid var(--border);

	padding: 0 8px;
}

.table tbody tr {
	cursor: pointer;

	transition: all 0.1s var(--bezier);
}

.table tbody tr:hover {
	background: rgba(255, 255, 255, 0.04);
}

.w {
	width: 1px;
}
</style>
