<script setup>
/**
 * Vendor
 */
import { ref, reactive, computed, onMounted, nextTick } from "vue"
import { Searcher } from "fast-fuzzy"

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

/**
 * Local
 */
import PoolCard from "./PoolCard.vue"

const props = defineProps({
	pools: {
		type: Object,
		required: true,
	},
	poolsStates: {
		type: Object,
	},
	poolsAPY: {
		type: Object,
	},
	positions: {
		type: Array,
	},
})
const emit = defineEmits(["onSelectPool", "onRequestWithdraw", "onShare"])

const searchEl = ref(null)
const searchText = ref("")
const poolsSearcher = ref({})

const isSearchEnabled = ref(false)
const toggleSearch = () => {
	isSearchEnabled.value = !isSearchEnabled.value

	nextTick(() => {
		if (isSearchEnabled.value) searchEl.value.focus()
	})
}

const sorts = ref([
	{
		title: "Pool TVL",
		key: "pool_tvl",
	},
	{
		title: "My TVL",
		key: "my_tvl",
	},
	{
		title: "Share Price",
		key: "share_price",
	},
	{
		title: "APY",
		key: "apy",
	},
])
const sort = reactive({
	by: "pool_tvl",
	dir: "desc",
})

const filteredPools = computed(() => {
	if (searchText.value) {
		let findedPools = poolsSearcher.value
			.search(searchText.value.toString(), {
				returnMatchData: true,
			})
			.map((el) => el.item)

		return findedPools
	} else {
		let allPools = [...props.pools]

		return allPools
	}
})

const sortedPools = computed(() => {
	switch (sort.by) {
		case "pool_tvl":
			if (sort.dir === "desc") {
				return filteredPools.value.sort(
					(a, b) =>
						props.poolsStates[
							b.address
						]?.totalLiquidity.toNumber() -
						props.poolsStates[a.address]?.totalLiquidity.toNumber(),
				)
			} else {
				return filteredPools.value.sort(
					(a, b) =>
						props.poolsStates[
							a.address
						]?.totalLiquidity.toNumber() -
						props.poolsStates[b.address]?.totalLiquidity.toNumber(),
				)
			}
			break
		case "my_tvl":
			const positions = {}
			props.positions.forEach((pos) => {
				positions[pos.poolId] = pos
			})

			if (sort.dir === "desc") {
				return filteredPools.value.sort(
					(a, b) =>
						(positions[b.address]
							? positions[b.address].depositedAmount
							: 0) -
						(positions[a.address]
							? positions[a.address].depositedAmount
							: 0),
				)
			} else {
				return filteredPools.value.sort(
					(a, b) =>
						(positions[a.address]
							? positions[a.address].depositedAmount
							: 0) -
						(positions[b.address]
							? positions[b.address].depositedAmount
							: 0),
				)
			}
			break
		case "share_price":
			if (sort.dir === "desc") {
				return filteredPools.value.sort(
					(a, b) =>
						props.poolsStates[b.address]?.sharePrice.toNumber() -
						props.poolsStates[a.address]?.sharePrice.toNumber(),
				)
			} else {
				return filteredPools.value.sort(
					(a, b) =>
						props.poolsStates[a.address]?.sharePrice.toNumber() -
						props.poolsStates[b.address]?.sharePrice.toNumber(),
				)
			}
			break
		case "apy":
			if (sort.dir === "desc") {
				return filteredPools.value.sort(
					(a, b) =>
						props.poolsAPY[b.address] - props.poolsAPY[a.address],
				)
			} else {
				return filteredPools.value.sort(
					(a, b) =>
						props.poolsAPY[a.address] - props.poolsAPY[b.address],
				)
			}
			break
	}
})

const activePools = computed(() =>
	props.pools.filter((pool) => !pool.isDepositPaused),
)

const handleSearchKeydown = (e) => {
	e.stopPropagation()

	if (e.key === "Escape") {
		isSearchEnabled.value = false
		searchText.value = ""
	}
}

const getPositionByPool = (pool) => {
	return props.positions.find((pos) => pos.poolId == pool.address)
}
onMounted(() => {
	poolsSearcher.value = new Searcher(props.pools, {
		keySelector: (item) => {
			let { name } = item

			if (name.includes("XTZ")) {
				name += " Tezos"
			}
			if (name.includes("BTC")) {
				name += " Bitcoin"
			}
			if (name.includes("ETH")) {
				name += " Ethereun"
			}

			if (name.includes("1H")) {
				name += " 1 hour"
			}
			if (name.includes("6H")) {
				name += " 6 hours"
			}
			if (name.includes("1D")) {
				name += " 1 day"
			}

			return name.replace("Juster Pool: ", "").replaceAll("-", " ")
		},
		threshold: 0.62,
	})
})
</script>

<template>
	<Flex direction="column" gap="24">
		<Flex align="center" justify="between">
			<Flex direction="column" gap="8">
				<Text size="16" weight="600" color="primary">Pools</Text>
				<Text size="14" weight="500" color="tertiary">
					{{
						searchText.length
							? filteredPools.length
							: activePools.length
					}}
					{{ searchText.length ? "found" : "active" }} pools
				</Text>
			</Flex>

			<Flex align="center" gap="8">
				<Flex align="center" gap="4">
					<transition name="popup">
						<Flex
							v-if="isSearchEnabled"
							align="center"
							:class="$style.search_field"
						>
							<input
								v-model="searchText"
								@keydown="handleSearchKeydown"
								ref="searchEl"
								placeholder="Search a pool"
							/>
						</Flex>
					</transition>

					<Button @click="toggleSearch" type="secondary" size="small">
						<Icon
							:name="isSearchEnabled ? 'close' : 'search'"
							size="16"
						/>
					</Button>
				</Flex>

				<Flex align="center" gap="2">
					<Button
						@click="
							sort.dir == 'desc'
								? (sort.dir = 'asc')
								: (sort.dir = 'desc')
						"
						type="secondary"
						size="small"
						style="border-radius: 6px 2px 2px 6px"
					>
						<Icon
							name="sort_desc"
							size="16"
							:style="{
								transform: `rotate(${
									sort.dir == 'asc' ? '180' : '0'
								}deg)`,
							}"
						/>
					</Button>

					<Dropdown>
						<template #trigger>
							<Button
								type="secondary"
								size="small"
								style="border-radius: 2px 6px 6px 2px"
							>
								<Flex>
									<Text height="1" color="tertiary">
										Sort by&nbsp;
									</Text>
									{{
										sorts.find((s) => sort.by === s.key)
											.title
									}}
								</Flex>
							</Button>
						</template>

						<template #dropdown>
							<DropdownItem
								v-for="s in sorts"
								@click="sort.by = s.key"
							>
								{{ s.title }}
							</DropdownItem>
						</template>
					</Dropdown>
				</Flex>
			</Flex>
		</Flex>

		<Flex direction="column" gap="16">
			<PoolCard
				v-for="(pool, index) in sortedPools"
				:key="index"
				@onShare="(pool) => emit('onShare', pool)"
				@onSelectPool="(pool) => emit('onSelectPool', pool)"
				@onRequestWithdraw="(pool) => emit('onRequestWithdraw', pool)"
				:pool="pool"
				:position="getPositionByPool(pool)"
				:state="poolsStates[pool.address]"
				:apy="poolsAPY[pool.address]"
			/>
		</Flex>
	</Flex>
</template>

<style module>
.search_field {
	height: 32px;

	border-radius: 6px;
	background: var(--opacity-05);

	padding: 0 8px;
}

.search_field input {
	border: none;
	outline: none;
	width: 100%;
	padding: 0;

	font-size: 14px;
	font-weight: 600;
	line-height: 1;
	color: var(--text-primary);
}

.search_field input::placeholder {
	font-weight: 500;
}
</style>
