<script setup>
/**
 * Vendor
 */
import { ref, onMounted, onUnmounted, computed, watch } from "vue"
import { useMeta } from "vue-meta"

/**
 * Local
 */
import MyFunds from "./MyFunds.vue"
import MyStatistics from "./MyStatistics.vue"
import BottomInfo from "./BottomInfo.vue"
import PoolsStats from "./PoolsStats.vue"
import PoolsList from "./PoolsList.vue"
import PoolsChart from "./PoolsChart.vue"

/**
 * UI
 */
import Block from "@ui/Block.vue"

/**
 * Modal
 */
import PoolsModal from "@local/modals/pools/PoolsModal.vue"
import DepositModal from "@local/modals/pools/DepositModal.vue"

/**
 * Services
 */
import { flags, updateFlag } from "@/services/flags"
import { juster } from "@sdk"

/**
 * Models
 */
import { entryLiquidity as entryLiquidityModel } from "@/graphql/models"

/**
 * Store
 */
import { useAccountStore } from "@store/account"
import { useNotificationsStore } from "@store/notifications"
import { useMarketStore } from "@store/market"

const accountStore = useAccountStore()
const notificationsStore = useNotificationsStore()
const marketStore = useMarketStore()

const showPoolsModal = ref(false)
const showDepositModal = ref(false)

const handleSelectPool = (pool) => {
	selectedPool.value = pool

	showPoolsModal.value = false
	showDepositModal.value = true
}

const handleBackFromDeposit = () => {
	showDepositModal.value = false
	showPoolsModal.value = true
}

const handleClosePoolsWarning = () => {
	updateFlag("showGeneralPoolsWarning", false)

	notificationsStore.create({
		notification: {
			type: "success",
			title: "Warning is now hidden",
			autoDestroy: true,

			actions: [
				{
					name: "Undo",
					icon: "back",
					callback: () => {
						updateFlag("showGeneralPoolsWarning", true)
					},
				},
			],
		},
	})
}

/**
 * Pools
 */

const pools = computed(() => marketStore.pools)
const selectedPool = ref({})

const poolsStates = ref({})

const subEntries = ref({})
const entries = ref([])

const populatePools = async () => {
	for (const index in pools.value) {
		if (!Object.hasOwnProperty.call(pools.value, index)) return
		const pool = pools.value[index]

		poolsStates.value[pool.address] = await juster.pools[
			pool.address
		].getLastPoolState()
	}
}

const setupSubscriptionToEntries = async () => {
	subEntries.value = await juster.gql
		.subscription({
			entryLiquidity: [
				{
					where: {
						pool: {
							address: {
								_in: pools.value.map((pool) => pool.address),
							},
						},
						user: { address: { _eq: accountStore.pkh } },
					},
				},
				entryLiquidityModel,
			],
		})
		.subscribe({
			next: ({ entryLiquidity }) => {
				entries.value = entryLiquidity
			},
			error: console.error,
		})
}

onMounted(() => {
	if (Object.keys(juster.pools).length) {
		setupSubscriptionToEntries()
		populatePools()
	}

	/** Test: entryLiquidity */
})

onUnmounted(() => {
	if (
		Object.prototype.hasOwnProperty.call(subEntries.value, "_state") &&
		!subEntries.value?.closed
	) {
		subEntries.value.unsubscribe()
	}
})

watch(
	() => juster.pools,
	() => {
		setupSubscriptionToEntries()
		populatePools()
	},
	{
		deep: true,
	},
)

/** Meta */
const { meta } = useMeta({
	title: `Liquidity Pools`,
	description: "Liquidity Pools Managemenet",
})
</script>

<template>
	<div :class="$style.wrapper">
		<metainfo>
			<template v-slot:title="{ content }"
				>{{ content }} • Juster</template
			>
		</metainfo>

		<!-- Modals -->
		<PoolsModal
			v-if="pools.length"
			:show="showPoolsModal"
			:pools="pools"
			:poolsStates="poolsStates"
			@onSelectPool="handleSelectPool"
			@onClose="showPoolsModal = false"
		/>
		<DepositModal
			:show="showDepositModal"
			:selectedPool="selectedPool"
			:state="poolsStates[selectedPool.address]"
			@onBack="handleBackFromDeposit"
			@onClose="showDepositModal = false"
		/>

		<Flex align="center" :class="$style.head">
			<h1 :class="$style.title">Liquidity Pools</h1>
		</Flex>

		<Flex justify="between" :class="$style.content">
			<Flex direction="column" gap="24" :class="$style.side">
				<MyFunds
					:pools="pools"
					:poolsStates="poolsStates"
					:entries="entries"
					@onDepositLiquidity="showPoolsModal = true"
				/>

				<MyStatistics :entries="entries" />

				<BottomInfo
					v-if="pools.length"
					:pool="pools[0]"
					:class="$style.bottom_left_block"
				/>
			</Flex>

			<Flex direction="column" gap="24" wide :class="$style.base">
				<PoolsStats :pools="pools" :poolsStates="poolsStates" />

				<PoolsChart />

				<Block
					v-if="flags.showGeneralPoolsWarning"
					@onClose="handleClosePoolsWarning"
				>
					<span>Current APYs is approximate.</span> Values may change
					by ~5% over the next few months. Planning for long-term
					income based on these values may differ from the actual.
				</Block>

				<transition name="fade">
					<PoolsList
						v-if="pools.length"
						:pools="pools"
						:poolsStates="poolsStates"
						@onSelectPool="handleSelectPool"
						:class="$style.list"
					/>
				</transition>

				<BottomInfo
					v-if="pools.length"
					:pool="pools[0]"
					:class="$style.bottom_right_block"
				/>
			</Flex>
		</Flex>
	</div>
</template>

<style module>
.wrapper {
}

.title {
	font-size: 16px;
}

.head {
	border-bottom: 1px solid var(--border);

	padding-bottom: 16px;
	margin-bottom: 24px;
}

.side {
	max-width: 450px;
}

.base {
	max-width: 760px;

	margin-left: 32px;
}

.list {
	margin-top: 32px;
}

.bottom_right_block {
	display: none;
}

@media (max-width: 1000px) {
	.content {
		flex-direction: column;

		gap: 40px;
	}

	.bottom_left_block {
		display: none;
	}

	.bottom_right_block {
		display: flex;
	}

	.side {
		max-width: initial;
	}

	.base {
		margin: 0;
		max-width: initial;
	}
}
</style>
