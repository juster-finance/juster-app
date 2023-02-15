<script setup>
/**
 * Vendor
 */
import { ref, onMounted, onUnmounted, computed, watch } from "vue"
import { useMeta } from "vue-meta"
import { useRoute } from "vue-router"
import { makeSummaryPosition } from "@juster-finance/sdk"
import BN from "bignumber.js"

/**
 * Local
 */
import MyFunds from "./MyFunds.vue"
import BottomInfo from "./BottomInfo.vue"
import PoolsStats from "./PoolsStats.vue"
import PoolsChart from "./PoolsChart.vue"
import MySummary from "./MySummary.vue"
import { EventCard, EventCardLoading } from "@local/EventCard"

/**
 * Modal
 */
import SharePoolModal from "@local/modals/pools/SharePoolModal.vue"
import DepositModal from "@local/modals/pools/DepositModal.vue"
import RequestWithdrawModal from "@local/modals/pools/RequestWithdrawModal.vue"
import WithdrawClaimsModal from "@local/modals/pools/WithdrawClaimsModal.vue"

/**
 * Services
 */
import { juster } from "@sdk"
import { parsePoolName } from "@utils/misc"

/**
 * Models
 */
import {
	entryLiquidity as entryLiquidityModel,
	poolPosition as poolPositionModel,
	poolState as poolStateModel,
	poolEvent as poolEventModel,
} from "@/graphql/models"

/**
 * Store
 */
import { useAccountStore } from "@store/account"
import { useMarketStore } from "@store/market"

const accountStore = useAccountStore()
const marketStore = useMarketStore()

const route = useRoute()

const showSharePoolModal = ref(false)
const showPoolsModal = ref(false)
const showDepositModal = ref(false)
const showWithdrawClaimsModal = ref(false)
const showRequestWithdrawModal = ref(false)

const handleShare = (pool) => {
	selectedPool.value = pool

	showSharePoolModal.value = true
}

const handleBackFromDeposit = () => {
	showDepositModal.value = false
	showPoolsModal.value = true
}

/**
 * Pools
 */

const pools = computed(() => marketStore.pools)
const pool = computed(() =>
	marketStore.pools.find((p) => p.address === route.params.address),
)
const poolDuration = ref(0)
const selectedPool = ref({})
const poolState = ref({})
const poolAPY = ref(0)
const isPoolStateReady = ref(false)

const summary = ref({})

/**
 * Pool Position
 */
const subPositions = ref({})
const position = ref(null)
const isPositionReady = ref(false)

/**
 * Entries
 */
const subEntries = ref({})
const entries = ref([])

/**
 * States
 */
const subStates = ref({})

/**
 * Events
 */
const subEvents = ref({})
const events = ref([])

const populatePool = async () => {
	poolState.value = await juster.pools[
		route.params.address
	].getLastPoolState()

	poolAPY.value = (
		await juster.pools[route.params.address].getAPY()
	).toNumber()

	setupSubToStates()
}

const isFullReady = computed(
	() => isPoolStateReady.value && isPositionReady.value,
)

const setupSubToStates = async () => {
	subStates.value = await juster.gql
		.subscription({
			poolState: [
				{
					where: {
						pool: {
							address: {
								_eq: route.params.address,
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
			next: ({ poolState: pState }) => {
				const newPoolState = pState[0]
				const currentPoolState = poolState.value

				if (newPoolState.counter === currentPoolState.counter) return
				if (newPoolState.counter > currentPoolState.counter) {
					poolState.value = newPoolState
				}
			},
			error: console.error,
		})
}

const setupSubToEntries = async () => {
	subEntries.value = await juster.gql
		.subscription({
			entryLiquidity: [
				{
					where: {
						pool: {
							address: {
								_eq: route.params.address,
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
							_eq: route.params.address,
						},
					},
				},
				poolPositionModel,
			],
		})
		.subscribe({
			next: ({ poolPosition }) => {
				position.value = poolPosition[0]
				isPositionReady.value = true
			},
			error: console.error,
		})
}

const setupSubToEvents = async () => {
	subEvents.value = await juster.gql
		.subscription({
			poolEvent: [
				{
					where: {
						event: {
							status: {
								_in: ["NEW", "STARTED"],
							},
						},
						poolId: {
							_eq: pool.value.address,
						},
					},
				},
				poolEventModel,
			],
		})
		.subscribe({
			next: ({ poolEvent }) => {
				events.value = poolEvent.map((e) => e.event)
				poolDuration.value = events.value[0].measurePeriod
			},
			error: console.error,
		})
}

const showAnimation = ref(false)
onMounted(() => {
	showAnimation.value = true

	if (Object.keys(juster.pools).length && pool.value) {
		init()
	}
})

const isInited = ref(false)
const init = () => {
	isInited.value = true

	setupSubToEntries()
	setupSubToPositions()
	populatePool()
	setupSubToEvents()
}

/**
 * Deposits with an amount <1 xtz need manual confirmation
 */
const handleManualEntryApprove = async (entry) => {
	await juster.provider.client.requestOperation({
		operationDetails: [
			{
				kind: "TRANSACTION",
				amount: "0",
				destination: entry.pool.address,
				parameters: {
					entrypoint: "approveEntry",
					value: {
						inta: entry.entryId,
					},
				},
			},
		],
	})
}

const handleRequestWithdraw = () => {
	if (!position.value) return
	showRequestWithdrawModal.value = true
}

onUnmounted(() => {
	if (
		Object.prototype.hasOwnProperty.call(subEntries.value, "_state") &&
		!subEntries.value?.closed
	) {
		subEntries.value.unsubscribe()
	}

	if (
		Object.prototype.hasOwnProperty.call(subPositions.value, "_state") &&
		!subPositions.value?.closed
	) {
		subPositions.value.unsubscribe()
	}

	if (
		Object.prototype.hasOwnProperty.call(subStates.value, "_state") &&
		!subStates.value?.closed
	) {
		subStates.value.unsubscribe()
	}
})

watch(
	() => position.value,
	() => {
		if (!position.value) return
		position.value.shares = BN(position.value.shares)
	},
)
watch(
	() => poolState.value,
	() => {
		if (!poolState.value) return
		isPoolStateReady.value = true
	},
)
watch(
	() => isFullReady.value,
	() => {
		if (!position.value) return
		summary.value = makeSummaryPosition(position.value, poolState.value)
	},
)

/** Wait for a long initialisation of the pool */
watch(
	() => pool.value,
	() => {
		if (!isInited.value) {
			init()
		}
	},
)

/** Meta */
const { meta } = useMeta({
	title: `Liquidity Pools`,
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

			<!-- Modals -->
			<SharePoolModal
				:show="showSharePoolModal"
				:pool="selectedPool"
				@onClose="showSharePoolModal = false"
			/>
			<DepositModal
				:show="showDepositModal"
				:selectedPool="pool"
				:state="poolState"
				:apy="poolAPY"
				@onBack="handleBackFromDeposit"
				@onClose="showDepositModal = false"
			/>
			<RequestWithdrawModal
				:show="showRequestWithdrawModal"
				:selectedPool="pool"
				:state="poolState"
				:position="position"
				@onClose="showRequestWithdrawModal = false"
			/>
			<WithdrawClaimsModal
				:show="showWithdrawClaimsModal"
				:positions="[position]"
				:pool="pool"
				@onClose="showWithdrawClaimsModal = false"
			/>

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
					{{
						pool &&
						parsePoolName(pool.name.replace("Juster Pool: ", ""))
					}}
				</Text>
			</Flex>

			<Flex justify="between" :class="$style.content">
				<Flex direction="column" gap="24" :class="$style.side">
					<MyFunds
						title="My Pool Funds"
						:pools="[pool]"
						:poolsStates="[poolState]"
						:entries="entries"
						:positions="position ? [position] : []"
						:summaries="summary.totalDeposited ? [summary] : []"
						:poolDuration="poolDuration"
						:isReady="isFullReady"
						@onManualEntryApprove="handleManualEntryApprove"
						@onDepositLiquidity="showDepositModal = true"
						@onRequestWithdraw="handleRequestWithdraw"
						@onGetClaims="showWithdrawClaimsModal = true"
					/>

					<MySummary
						v-if="summary.totalDeposited"
						:summary="summary"
					/>

					<BottomInfo
						v-if="pools.length"
						:pool="pools[0]"
						:class="$style.bottom_left_block"
					/>
				</Flex>

				<Flex direction="column" gap="24" wide :class="$style.base">
					<PoolsStats :pools="[pool]" :poolsStates="[poolState]" />

					<PoolsChart v-if="pool" :pool="pool" />

					<Flex direction="column" gap="24" :class="$style.events">
						<Flex direction="column" gap="8">
							<Text size="16" weight="600" color="primary">
								Pool line
							</Text>
							<Text size="14" weight="500" color="tertiary">
								Events launched based on this pool
							</Text>
						</Flex>

						<Flex :class="$style.items">
							<EventCardLoading
								v-if="!events.length"
								v-for="i in 2"
								:key="i"
							/>
							<EventCard
								v-else
								v-for="event in events"
								:key="event.id"
								:event="event"
							/>
						</Flex>
					</Flex>

					<BottomInfo
						v-if="pools.length"
						:pool="pools[0]"
						:class="$style.bottom_right_block"
					/>
				</Flex>
			</Flex>
		</div>
	</transition>
</template>

<style module>
.title {
	font-size: 16px;
}

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

.side {
	max-width: 450px;
	width: 100%;
}

.base {
	max-width: 760px;

	margin-left: 32px;
}

.events {
	margin-top: 32px;
}

.items {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
	grid-gap: 16px;
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

		position: initial;
	}

	.base {
		margin: 0;
		max-width: initial;
	}
}
</style>
