<script setup>
/**
 * Vendor
 */
import { ref, onMounted, onUnmounted, watch } from "vue"
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
import { poolPosition as poolPositionModel } from "@/graphql/models"

/**
 * Store
 */
import { useAccountStore } from "@store/account"
import { useMarketStore } from "@store/market"
import { sort } from "d3-array"

const accountStore = useAccountStore()
const marketStore = useMarketStore()

/**
 * Pools
 */
const positions = ref([])
const subPositions = ref({})

const sortBy = ref(null)
const handleSort = (target) => {
	if (!sortBy.value) {
		sortBy.value = `${target}_desc`
	} else if (sortBy.value === `${target}_desc`) {
		sortBy.value = `${target}_asc`
	} else {
		sortBy.value = null
	}
}

const setupSubToPositions = async () => {
	subPositions.value = await juster.gql
		.subscription({
			poolPosition: [
				{
					where: {
						userId: {
							_eq: accountStore.pkh,
						},
						poolId: {
							_in: marketStore.pools.map((p) => p.address),
						},
					},
				},
				poolPositionModel,
			],
		})
		.subscribe({
			next: ({ poolPosition }) => {
				positions.value = poolPosition
			},
			error: console.error,
		})
}

const showAnimation = ref(false)
onMounted(() => {
	showAnimation.value = true

	if (Object.keys(juster.pools).length) {
		setupSubToPositions()
	}
})

onUnmounted(() => {
	if (
		Object.prototype.hasOwnProperty.call(subPositions.value, "_state") &&
		!subPositions.value?.closed
	) {
		subPositions.value.unsubscribe()
	}
})

watch(
	() => juster.pools,
	() => {
		setupSubToPositions()
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
				<template v-slot:title="{ content }">
					{{ content }} • Juster
				</template>
			</metainfo>

			<Flex align="center" gap="8" :class="$style.head">
				<Text size="16" weight="600" color="tertiary">
					<router-link to="/pools" :class="$style.link">
						Liquidity Pools
					</router-link>
				</Text>

				<Icon
					name="arrow"
					size="16"
					color="tertiary"
					style="rotate: -90deg"
				/>

				<Text size="16" weight="600" color="primary">
					Raw Positions
				</Text>
			</Flex>

			<Flex direction="column" gap="20" :class="$style.content">
				<!-- <Flex align="center" gap="8">
					<Button type="white" size="small">
						<Icon name="export" size="16" /> Export
					</Button>
					<Button type="secondary" size="small">
						<Icon name="filter" size="16" />
					</Button>
					<Button type="secondary" size="small">
						<Icon name="search" size="16" />
					</Button>
				</Flex> -->

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
									ADDRESS
								</Text>
							</td>
							<td
								@click="handleSort('tvl')"
								:class="$style.sort_btn"
							>
								<Text
									size="11"
									color="tertiary"
									weight="700"
									style="line-height: 14px"
								>
									TVL
								</Text>
								<Icon name="arrow_down" size="14" />
							</td>
							<td
								@click="handleSort('shares')"
								:class="$style.sort_btn"
							>
								<Text
									size="11"
									color="tertiary"
									weight="700"
									style="line-height: 14px"
								>
									SHARES
								</Text>
								<Icon name="arrow_down" size="14" />
							</td>
							<td
								@click="handleSort('claims')"
								:class="$style.sort_btn"
							>
								<Text
									size="11"
									color="tertiary"
									weight="700"
									style="line-height: 14px"
								>
									CLAIMS
								</Text>
								<Icon name="arrow_down" size="14" />
							</td>
							<td
								@click="handleSort('price')"
								:class="$style.sort_btn"
							>
								<Text
									size="11"
									color="tertiary"
									weight="700"
									style="line-height: 14px"
								>
									ENTRY PRICE
								</Text>
								<Icon name="arrow_down" size="14" />
							</td>
						</tr>
					</thead>

					<tbody>
						<tr v-for="position in positions">
							<td :class="$style.w">
								<Checkbox />
							</td>
							<td>
								<Text size="14" weight="600" color="secondary">
									{{
										position.pool.name.replace(
											"Juster Pool: ",
											"",
										)
									}}
								</Text>
							</td>
							<td>
								<Text size="14" weight="600" color="secondary">
									{{ position.poolId }}
								</Text>
							</td>
							<td>
								<Text size="14" weight="600" color="secondary">
									{{ position.depositedAmount }}
								</Text>
							</td>
							<td>
								<Text size="14" weight="600" color="secondary">
									{{ position.shares.toFixed(2) }}
								</Text>
							</td>
							<td>
								<Text size="14" weight="600" color="secondary">
									{{ position.claims.length }}
								</Text>
							</td>
							<td>
								<Text size="14" weight="600" color="secondary">
									{{ position.entrySharePrice.toFixed(2) }}
								</Text>
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

.sort_btn {
	cursor: pointer;
}
</style>
