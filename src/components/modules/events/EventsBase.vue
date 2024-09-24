<script setup>
import {
	reactive,
	ref,
	onMounted,
	watch,
	computed,
	onBeforeUnmount,
	onUnmounted,
} from "vue"
import { DateTime } from "luxon"
import { useMeta } from "vue-meta"
import cloneDeep from "lodash.clonedeep"

/**
 * Services
 */
import { juster, analytics, currentNetwork } from "@sdk"
import { verifiedMakers } from "@config"

/**
 * API
 */
import { fetchEventsByStatus } from "@/api/events"

/**
 * UI
 */
import Pagination from "@ui/Pagination.vue"
import Breadcrumbs from "@ui/Breadcrumbs.vue"
import Banner from "@ui/Banner.vue"
import Button from "@ui/Button.vue"

/**
 * Local
 */
import EventsFilters from "./EventsFilters.vue"
import { EventCard, EventCardLoading } from "@local/EventCard"

/**
 * gql
 */
import { event as eventModel } from "@/graphql/models"

/**
 * Store
 */
import { useMarketStore } from "@store/market"

const defaultFilters = {
	symbols: [
		{
			name: "TON-USD",
			active: true,
		},
		{
			name: "BTC-USD",
			active: true,
		},
		{
			name: "ETH-USD",
			active: true,
		},
	],

	periods: [
		{
			name: "5m",
			active: true,
		},
		{
			name: "1h",
			active: true,
		},
		{
			name: "6h",
			active: true,
		},
		{
			name: "24h",
			active: true,
		},
		{
			name: "7d",
			active: true,
		},
	],

	statuses: [
		{
			name: "New",
			icon: "event_new",
			color: "purple",
			active: true,
		},
		{
			name: "Running",
			icon: "event_active",
			color: "yellow",
			active: false,
		},
		{
			name: "Finished",
			icon: "checkcircle",
			color: "green",
			active: false,
		},
		{
			name: "Canceled",
			icon: "stop",
			color: "gray",
			active: false,
		},
	],

	advanced: {
		period: null,
		participants: [],
	},

	author: [
		{
			name: "Juster",
			icon: "logo_symbol",
			active: true,
		},
		{
			name: "Users",
			icon: "users",
			active: false,
		},
	],

	misc: {
		startingToday: {
			active: false,
			disabled: false,
		},
		moreThan: {
			active: false,
			disabled: false,
		},
		targetDynamics: {
			active: false,
			disabled: false,
		},
	},
}

const breadcrumbs = reactive([
	{
		name: "All events",
		path: "/events",
	},
])

const marketStore = useMarketStore()

const subscription = ref(null)

const isNewEventsLoaded = ref(false)
const isFinishedEventsLoaded = ref(false)

const currentPage = ref(1)

let filters = ref(cloneDeep(defaultFilters))

const isFinishedEventsToggled = computed(() =>
	filters.value.statuses.find((s) => s.name === "Finished" && s.active),
)

const showFilters = ref(false)

/** reset "currentPage" when changing filters */
watch(
	filters.value,
	() => {
		currentPage.value = 1
	},
	{ deep: true },
)

const liquidityFilters = reactive({
	min: 0,
	max: 50000,
})

const handleNewMin = (value) => {
	liquidityFilters.min = value
}

const handleNewMax = (value) => {
	liquidityFilters.max = value
}

const handleSelect = (filter, target) => {
	filters.value[filter].forEach((elem) => {
		if (target.name == elem.name) elem.active = !elem.active
	})
}

const handleResetFilters = () => {
	liquidityFilters.min = 0
	liquidityFilters.max = 50000

	filters.value = cloneDeep(defaultFilters)
}

const handleManageParticipant = ({ address, action }) => {
	if (action == "add") {
		if (filters.value.advanced.participants.includes(address)) return

		filters.value.advanced.participants.push(address)
	}

	if (action == "remove") {
		const indexOfAddress =
			filters.value.advanced.participants.indexOf(address)

		if (indexOfAddress !== -1) {
			filters.value.advanced.participants.splice(indexOfAddress, 1)
		}
	}
}

/** Events */
const filteredEvents = computed(() => {
	let events = cloneDeep(marketStore.events)

	/** Filter by Symbol */
	if (filters.value.symbols.some((symbol) => symbol.active)) {
		const selectedSymbols = filters.value.symbols
			.filter((symbol) => symbol.active)
			.map((symbol) => symbol.name)

		events = events.filter((event) =>
			selectedSymbols.includes(event.currencyPair.symbol),
		)
	} else {
		return []
	}

	/** Filter by Liquidity */
	events = events.filter(
		(event) => event.totalLiquidityProvided >= liquidityFilters.min,
	)
	events = events.filter(
		(event) => event.totalLiquidityProvided <= liquidityFilters.max,
	)

	/** Filter by Status */
	if (filters.value.statuses.length) {
		const statuses = filters.value.statuses
			.filter((status) => status.active)
			.map((status) => {
				if (status.name == "New") return "NEW"
				if (status.name == "Running") return "STARTED"
				if (status.name == "Finished") return "FINISHED"
				if (status.name == "Canceled") return "CANCELED"
			})

		events = events.filter((event) => statuses.includes(event.status))
	}

	/** Filter by Period */
	if (filters.value.periods.length) {
		const periods = filters.value.periods
			.filter((period) => period.active)
			.map(
				(period) =>
					(period.name == "5m" && 300) ||
					(period.name == "1h" && 3600) ||
					(period.name == "6h" && 21600) ||
					(period.name == "24h" && 86400) ||
					(period.name == "7d" && 604800),
			)

		if (periods.length) {
			events = events.filter((event) =>
				periods.includes(event.measurePeriod),
			)
		} else {
			events = []
		}
	}

	/** Advanced */
	if (filters.value.advanced.period) {
		events = events.filter((event) =>
			DateTime.fromISO(event.betsCloseTime).hasSame(
				DateTime.fromFormat(
					filters.value.advanced.period,
					"yyyy-mm-dd",
				),
				"day",
			),
		)
	}

	if (filters.value.advanced.participants.length) {
		events = events.filter((event) => {
			const hasBet = event.bets
				.map((bet) => bet.userId)
				.some((userId) =>
					filters.value.advanced.participants.includes(userId),
				)
			const hasDeposit = event.deposits
				.map((deposit) => deposit.userId)
				.some((userId) =>
					filters.value.advanced.participants.includes(userId),
				)

			return hasBet || hasDeposit
		})
	}

	/** Filter by Author */
	if (!filters.value.author[0].active) {
		/** juster */
		events = events.filter(
			(event) =>
				!verifiedMakers[currentNetwork.value].includes(event.creatorId),
		)
	}
	if (!filters.value.author[1].active) {
		/** other users */
		events = events.filter((event) =>
			verifiedMakers[currentNetwork.value].includes(event.creatorId),
		)
	}

	/** Filter by Misc */
	if (filters.value.misc.startingToday.active) {
		events = events.filter((event) =>
			DateTime.fromISO(event.betsCloseTime).hasSame(
				DateTime.local(),
				"day",
			),
		)
	}

	if (filters.value.misc.moreThan.active) {
		events = events.filter((event) => {
			let participants = [
				...event.bets.map((bet) => bet.userId),
				...event.deposits.map((deposit) => deposit.userId),
			]

			/** remove duplicates */
			participants = [...new Set(participants)]

			return participants.length > 1
		})
	}

	if (!filters.value.misc.targetDynamics.active) {
		events = events.filter((event) => event.targetDynamics == 1)
	} else {
		events = events.filter((event) => event.targetDynamics !== 1)
	}

	return events
})

onMounted(async () => {
	analytics.log("onPage", { name: "AllEvents" })

	let newEvents = await fetchEventsByStatus({ status: "NEW" })
	isNewEventsLoaded.value = true
	marketStore.events = cloneDeep(newEvents)

	let runningEvents = await fetchEventsByStatus({ status: "STARTED" })
	marketStore.events = [...marketStore.events, ...cloneDeep(runningEvents)]

	let finishedEvents = await fetchEventsByStatus({ status: "FINISHED" })
	isFinishedEventsLoaded.value = true
	marketStore.events = [
		...marketStore.events,
		...cloneDeep(finishedEvents).sort(
			(a, b) =>
				DateTime.fromISO(b.createdTime).ts -
				DateTime.fromISO(a.createdTime).ts,
		),
	]

	// Sub to New Events
	subscription.value = await juster.gql
		.subscription({
			event: [
				{
				},
				{
					...eventModel,
				},
			],
		})
		.subscribe({
			next: (data) => {
				const { event: newEvents } = data

				newEvents.forEach((newEvent) => {
					if (marketStore.events.some((event) => newEvent.id == event.id)) {
						marketStore.updEvent(newEvent)
					} else {
						marketStore.events.push(newEvent)
					}
				})
			},
			error: console.error,
		})
})

onBeforeUnmount(() => {
	marketStore.events = []
})

onUnmounted(() => {
	if (
		subscription.value &&
		Object.prototype.hasOwnProperty.call(subscription.value, "_state") &&
		!subscription.value?.closed
	) {
		subscription.value.unsubscribe()
	}
})

/** Meta */
useMeta({
	title: `All events`,
	description: "All available events",
})
</script>

<template>
	<div :class="$style.wrapper">
		<metainfo>
			<template #title="{ content }">{{ content }} • Juster</template>
		</metainfo>

		<Breadcrumbs :crumbs="breadcrumbs" :class="$style.breadcrumbs" />

		<Flex direction="column" gap="32">
			<Flex direction="column" gap="8">
				<h1>All events</h1>
				<Text size="14" height="16" weight="500" color="tertiary">
					List of all new, running, and past events with customizable
					filtering
				</Text>
			</Flex>

			<Button
				@click="showFilters = !showFilters"
				type="secondary"
				size="small"
				block
				:class="$style.show_filters_btn"
				><Icon name="filter" size="14" />
				{{ showFilters ? "Hide" : "Show" }} Filters</Button
			>

			<Flex gap="40" :class="$style.container">
				<EventsFilters
					:filters="filters"
					:liquidity-filters="liquidityFilters"
					:events="marketStore.events"
					:filtered-events-count="filteredEvents.length"
					@onNewMin="handleNewMin"
					@onNewMax="handleNewMax"
					@onSelect="handleSelect"
					@onReset="handleResetFilters"
					@onManageParticipant="handleManageParticipant"
					:class="[$style.filters_block, showFilters && $style.show]"
				/>

				<div :class="$style.events_base">
					<Banner
						v-if="
							!isFinishedEventsLoaded && isFinishedEventsToggled
						"
						loading
						color="gray"
						size="small"
					>
						Last thousand finished events is loading
					</Banner>

					<transition name="fastfade" mode="out-in">
						<Flex
							v-if="filteredEvents.length"
							direction="column"
							gap="16"
						>
							<div :class="$style.events">
								<EventCard
									v-for="event in filteredEvents.slice(
										(currentPage - 1) * 6,
										currentPage * 6,
									)"
									:key="event.id"
									:event="event"
								/>
							</div>

							<Pagination
								v-if="filteredEvents.length > 6"
								v-model="currentPage"
								:total="filteredEvents.length"
								:limit="6"
								:class="$style.pagination"
							/>
						</Flex>

						<div
							v-else-if="!isNewEventsLoaded"
							:class="$style.events"
						>
							<EventCardLoading />
							<EventCardLoading />
							<EventCardLoading />
						</div>

						<Banner
							v-else-if="
								!filteredEvents.length &&
								isNewEventsLoaded &&
								isFinishedEventsLoaded
							"
							icon="help"
							color="gray"
							size="small"
						>
							No events with the selected filters were found
						</Banner>
					</transition>
				</div>
			</Flex>
		</Flex>
	</div>
</template>

<style module>
.wrapper {
}

.breadcrumbs {
	margin-bottom: 24px;
}

.description {
	font-size: 14px;
	line-height: 1.6;
	font-weight: 500;
	color: var(--text-tertiary);

	margin-top: 8px;
	margin-bottom: 16px;
}

.show_filters_btn {
	display: none;
}

.filters_block {
	width: 300px;
}

.events_base {
	display: flex;
	flex-direction: column;
	gap: 20px;

	flex: 1;
}

.events {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
	grid-gap: 16px;
}

@media (max-width: 700px) {
	.container {
		flex-direction: column;
	}

	.show_filters_btn {
		display: flex;
	}

	.filters_block {
		display: none;

		width: 100%;
	}

	.filters_block.show {
		display: initial;
	}
}

@media (max-width: 420px) {
	.events {
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
	}
}
</style>
