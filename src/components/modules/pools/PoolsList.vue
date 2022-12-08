<script setup>
/**
 * Vendor
 */
import { ref, computed, onMounted, nextTick } from "vue"
import { search, Searcher } from "fast-fuzzy"

/**
 * UI
 */
import Button from "@ui/Button.vue"

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
	positions: {
		type: Array,
	},
})
const emit = defineEmits(["onSelectPool"])

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

				<Button type="secondary" size="small" disabled>
					<Icon name="sort_desc" size="16" />
				</Button>

				<Button type="secondary" size="small" disabled>
					<Icon name="filter" size="16" />
				</Button>
			</Flex>
		</Flex>

		<Flex direction="column" gap="16">
			<PoolCard
				v-for="(pool, index) in filteredPools"
				:key="index"
				@onSelectPool="(pool) => emit('onSelectPool', pool)"
				:pool="pool"
				:position="getPositionByPool(pool)"
				:state="poolsStates[pool.address]"
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
