<script setup>
/**
 * Vendor
 */
import { ref, onMounted, onBeforeUnmount, onUnmounted, watch } from "vue"
import { useRouter, useRoute } from "vue-router"
import { useMeta } from "vue-meta"
import cloneDeep from "lodash.clonedeep"

/**
 * Local
 */
import RatingCard from "./RatingCard.vue"
import RatingCardLoading from "./RatingCardLoading.vue"
import MyPositionCard from "./MyPositionCard.vue"
import FreshAccountBanner from "./FreshAccountBanner.vue"
import MarketCard from "@local/MarketCard.vue"
import { EventCard, EventCardLoading } from "@local/EventCard"

/**
 * UI
 */
import Button from "@ui/Button.vue"

/**
 * API
 */
import { fetchTopEvents } from "@/api/events"
import {
	fetchUser,
	fetchTopBettors,
	fetchTopLiquidityProviders,
} from "@/api/users"

/**
 * Subscriptions
 */
import { event as eventModel } from "@/graphql/models/events"

/**
 * Store
 */
import { useMarketStore } from "@store/market"
import { useAccountStore } from "@store/account"

/**
 * Services
 */
import { juster, analytics } from "@sdk"

const router = useRouter()
const route = useRoute()

const marketStore = useMarketStore()
const accountStore = useAccountStore()

const user = ref({})
const subToMyPositions = ref({})
const myPositions = ref([])

const topEvents = ref([])

/** Ranking */
const isTopProvidersLoading = ref(true)
const isTopBettorsLoading = ref(true)
const topProviders = ref([])
const topBettors = ref([])

const handleViewTopEvents = () => {
	router.push("/events/top")
}

const init = async () => {
	user.value = await fetchUser({ address: accountStore.pkh })

	/**
	 * Block: My Positions
	 */
	subToMyPositions.value = await juster.gql
		.subscription({
			position: [
				{
					where: {
						userId: { _eq: accountStore.pkh },
						event: { status: { _in: ["NEW", "STARTED"] } },
					},
				},
				{
					id: true,
					value: true,
					event: eventModel,
				},
			],
		})
		.subscribe({
			next: ({ position: positions }) => {
				myPositions.value = positions
			},
			error: console.error,
		})

	/**
	 * Block: Top Events & Providers
	 */
	const rawTopEvents = await fetchTopEvents({ limit: 3 })
	topEvents.value = rawTopEvents.sort((a, b) => b.bets.length - a.bets.length)

	const rawTopProviders = await fetchTopLiquidityProviders()
	const rawTopBettors = await fetchTopBettors()

	topProviders.value = rawTopProviders.map((el) => {
		return { address: el.address, userFriendlyAddress: el.userFriendlyAddress, value: el.totalProviderReward }
	})
	isTopProvidersLoading.value = false

	topBettors.value = rawTopBettors.map((el) => {
		return { address: el.address, userFriendlyAddress: el.userFriendlyAddress, value: el.totalBetsCount }
	})
	isTopBettorsLoading.value = false
}

watch(
	() => juster.sdk._network,
	() => {
		subToMyPositions.value.unsubscribe()
		myPositions.value = []
		marketStore.events = []
		topEvents.value = []
		topProviders.value = []
		isTopProvidersLoading.value = true
		topBettors.value = []
		isTopBettorsLoading.value = true

		init()
	},
)

const showAnimation = ref("")

onMounted(async () => {
	if (route.query.welcome == 1) {
		showAnimation.value = "slowslide"
	} else {
		showAnimation.value = "slide"
	}

	analytics.log("onPage", { name: "Explore" })

	init()
})
onBeforeUnmount(() => {
	topEvents.value = []
})

onUnmounted(() => {
	if (
		Object.prototype.hasOwnProperty.call(
			subToMyPositions.value,
			"_state",
		) &&
		!subToMyPositions.value?.closed
	) {
		subToMyPositions.value.unsubscribe()
	}
})

/** Meta */
useMeta({
	title: "Explore",
	description:
		"Juster is an on-chain smart contract platform allowing users to take part in an automated betting market by creating events, providing liquidity to them, and making bets.",
})
</script>

<template>
	<transition :name="showAnimation">
		<div v-if="showAnimation.length" :class="$style.wrapper">
			<metainfo>
				<template #title="{ content }">{{ content }} • Juster</template>
			</metainfo>

			<transition-group name="fade" mode="out-in">
				<FreshAccountBanner
					v-if="accountStore.pkh && !user"
					:class="$style.block"
				/>
				<!-- TODO: #3 -->
				<!-- <Flex
					justify="between"
					gap="40"
					:class="[$style.block, $style.billboard]"
				>
					<Flex gap="12">
						<Icon name="server" size="16" color="secondary" />
						<Flex direction="column" gap="8">
							<Text
								size="13"
								height="11"
								weight="600"
								color="primary"
								>Liquidity Pools now available</Text
							>
							<Text
								size="13"
								height="16"
								weight="500"
								color="tertiary"
								>Juster Pool is a new decentralized finance
								instrument that aims to provide a more flexible
								and decentralized market making process for
								users.</Text
							>
						</Flex>
					</Flex>

					<Button
						@click="router.push('/pools')"
						type="secondary"
						size="small"
					>
						<Icon name="login" size="16" />Go to Pools
					</Button>
				</Flex> -->

				<!-- My Positions -->
				<div v-if="myPositions.length" :class="$style.block">
					<h2>My Positions</h2>
					<div :class="$style.description">
						Events in which you have liquidity or bet
					</div>

					<div :class="$style.my_positions">
						<MyPositionCard
							v-for="position in myPositions"
							:key="position.id"
							:event="position.event"
						/>
					</div>
				</div>

				<!-- Top markets -->
				<div v-if="marketStore.isMarketsLoaded" :class="$style.block">
					<h2>Top Markets</h2>
					<div :class="$style.description">
						Currency pairs available for betting
					</div>

					<div :class="$style.items">
						<MarketCard
							v-for="market in marketStore.markets"
							:key="market.id"
							:market="market"
							data-cy="market-card"
						/>
					</div>
				</div>
			</transition-group>

			<!-- Top Liquidity -->
			<div :class="$style.block">
				<h2>Top Liquidity</h2>
				<div :class="$style.description">
					Rating of users providing liquidity
				</div>

				<RatingCard
					v-if="!isTopProvidersLoading"
					:users="topProviders"
					isTokenSuffix
					data-cy="rating-card-liquidity"
					:class="$style.rating_card"
				/>
				<RatingCardLoading v-else :class="$style.rating_card" />
			</div>

			<!-- Hot events -->
			<div :class="$style.block">
				<div :class="$style.head">
					<div :class="$style.left">
						<h2>Starting Soon</h2>
						<div :class="$style.description">
							Join the events that are about to start
						</div>
					</div>

					<Button
						@click="handleViewTopEvents"
						size="small"
						type="secondary"
					>
						<Icon name="collection" size="16" />View all
					</Button>
				</div>

				<transition name="fastfade" mode="out-in">
					<div v-if="topEvents.length" :class="$style.items">
						<EventCard
							v-for="event in topEvents"
							:key="event.id"
							:event="event"
							data-cy="event-card"
						/>
					</div>

					<div v-else :class="$style.items">
						<EventCardLoading />
						<EventCardLoading />
						<EventCardLoading />
					</div>
				</transition>
			</div>

			<!-- Top Bettors -->
			<div :class="$style.block">
				<h2>Top Bettors</h2>
				<div :class="$style.description">
					Rating of users placing bets
				</div>

				<RatingCard
					v-if="!isTopBettorsLoading"
					:users="topBettors"
					suffix="Bets"
					data-cy="rating-card-bettors"
					:class="$style.rating_card"
				/>
				<RatingCardLoading v-else :class="$style.rating_card" />
			</div>
		</div>
	</transition>
</template>

<style module>
.wrapper {
}

.block {
	margin-bottom: 60px;
}

.block:last-child {
	margin-bottom: 0;
}

.block h1 {
	letter-spacing: 0.5px;
}

.billboard {
	border: 2px solid rgba(255, 255, 255, 0.05);
	border-radius: 8px;

	padding: 16px;
}

.head {
	display: flex;
	justify-content: space-between;
}

.left {
	margin-right: 40px;
}

.description {
	font-size: 14px;
	font-weight: 500;
	line-height: 22px;
	color: var(--text-tertiary);

	margin-top: 8px;
}

.rating_card {
	margin-top: 24px;
}

.my_positions {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
	grid-gap: 16px;

	margin-top: 24px;
}

.items {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
	grid-gap: 16px;

	margin-top: 24px;
}

@media (max-width: 500px) {
	.head {
		flex-direction: column;
		gap: 16px;
	}

	.billboard {
		flex-direction: column;
		gap: 20px;
	}

	.my_positions {
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
	}
}

@media (max-width: 420px) {
	.items {
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
	}
}
</style>
