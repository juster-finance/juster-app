<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from "vue"
import { useMeta } from "vue-meta"
import { DateTime } from "luxon"
import { cloneDeep } from "lodash"

/**
 * UI
 */
import Button from "@/components/ui/Button"
import Banner from "@/components/ui/Banner"
import Pagination from "@/components/ui/Pagination"

/**
 * Local
 */
import { EventCard } from "@/components/local/EventCard"

/**
 * Modals
 */
import WithdrawAllModal from "@/components/local/modals/WithdrawAllModal"
import OperationModal from "@/components/local/modals/OperationModal"

/**
 * API
 */
import { fetchUserWithdrawals } from "@/api/users"

/**
 * Services
 */
import { numberWithSymbol } from "@/services/utils/amounts"

/**
 * Store
 */
import { useAccountStore } from "@/store/account"

const accountStore = useAccountStore()

const showWithdrawAllModal = ref(false)
const showOperationModal = ref(false)

const selectedWithdraw = ref({})
const handleSelectWithdraw = (target) => {
	selectedWithdraw.value = target
	showOperationModal.value = true
}

const withdrawalsHistory = ref([])

const subToNewPositions = ref({})

const currentPageHistory = ref(1)
const paginatedWithdrawalsHistory = computed(() =>
	withdrawalsHistory.value.slice(
		(currentPageHistory.value - 1) * 5,
		currentPageHistory.value * 5,
	),
)

const currentPageForPositions = ref(1)

const positionsForWithdraw = computed(() =>
	accountStore.positionsForWithdrawal.filter((position) => position.value),
)
const paginatedPositionsForWithdraw = computed(() =>
	positionsForWithdraw.value.slice(
		(currentPageForPositions.value - 1) * 6,
		currentPageForPositions.value * 6,
	),
)

const statistics = reactive({
	week: {
		value: 0,
		avg: 0,
	},
	month: {
		value: 0,
		avg: 0,
	},
	all: {
		value: 0,
		avg: 0,
	},
})

const sort = reactive({
	date: "desc",
	amount: "default",
})
const sortBy = (target) => {
	switch (target) {
		case "date":
			if (sort.date == "desc") {
				sort.date = "asc"
				withdrawalsHistory.value.sort(
					(a, b) =>
						new Date(a.event.closedOracleTime).getTime() -
						new Date(b.event.closedOracleTime).getTime(),
				)
			} else if (sort.date == "asc") {
				sort.date = "desc"
				withdrawalsHistory.value.sort(
					(a, b) =>
						new Date(b.event.closedOracleTime).getTime() -
						new Date(a.event.closedOracleTime).getTime(),
				)
			}

			break

		case "amount":
			if (sort.amount == "default") {
				sort.date = "default"

				sort.amount = "desc"
				withdrawalsHistory.value.sort((a, b) => b.amount - a.amount)
			} else if (sort.amount == "desc") {
				sort.amount = "asc"
				withdrawalsHistory.value.sort((a, b) => a.amount - b.amount)
			} else if (sort.amount == "asc") {
				sort.date = "desc"

				sort.amount = "default"
				withdrawalsHistory.value.sort(
					(a, b) =>
						new Date(b.event.closedOracleTime).getTime() -
						new Date(a.event.closedOracleTime).getTime(),
				)
			}

			break
	}
}

onMounted(async () => {
	/** History */
	const allUserWithdrawals = await fetchUserWithdrawals({
		address: accountStore.pkh,
	})
	withdrawalsHistory.value = cloneDeep(allUserWithdrawals)

	/**
	 * Statistics:
	 * @Week
	 * @Month
	 * @AllTime
	 */
	const withdrawalsLastWeek = withdrawalsHistory.value.filter(
		(withdraw) =>
			DateTime.fromISO(withdraw.event.closedOracleTime).ts >
			DateTime.now().minus({ days: 7 }).ts,
	)
	const withdrawalsLastMonth = withdrawalsHistory.value.filter(
		(withdraw) =>
			DateTime.fromISO(withdraw.event.closedOracleTime).ts >
			DateTime.now().minus({ days: 30 }).ts,
	)

	statistics.week.value = withdrawalsLastWeek.reduce(
		(acc, curr) => acc + curr.amount,
		0,
	)
	statistics.week.avg = withdrawalsLastWeek.length
		? statistics.week.value / withdrawalsLastWeek.length
		: 0

	statistics.month.value = withdrawalsLastMonth.reduce(
		(acc, curr) => acc + curr.amount,
		0,
	)
	statistics.month.avg = withdrawalsLastMonth.length
		? statistics.month.value / withdrawalsLastMonth.length
		: 0

	statistics.all.value = withdrawalsHistory.value.reduce(
		(acc, curr) => acc + curr.amount,
		0,
	)
	statistics.all.avg = withdrawalsHistory.value.length
		? statistics.all.value / withdrawalsHistory.value.length
		: 0
})

onUnmounted(() => {
	if (
		subToNewPositions.value.hasOwnProperty("_state") &&
		!subToNewPositions.value?.closed
	) {
		subToNewPositions.value.unsubscribe()
	}
})

/** Meta */
useMeta({
	title: "Withdrawals",
})
</script>

<template>
	<div :class="$style.wrapper">
		<WithdrawAllModal
			:show="showWithdrawAllModal"
			@onClose="showWithdrawAllModal = false"
		/>
		<OperationModal
			:show="showOperationModal"
			:data="selectedWithdraw"
			@onClose="showOperationModal = false"
		/>

		<metainfo>
			<template #title="{ content }">{{ content }} • Juster</template>
		</metainfo>

		<div :class="$style.block">
			<h2>Withdraw stats</h2>
			<div :class="$style.description">
				Your withdraw statistics for this month & all time
			</div>

			<div :class="$style.stats">
				<div :class="$style.stat">
					<div :class="$style.stat_name">Last week</div>
					<div :class="$style.stat_value">
						{{ statistics.week.value.toFixed(0) }} ꜩ
					</div>
					<div :class="$style.stat_avg">
						Avg
						<span>{{ statistics.week.avg.toFixed(0) }} ꜩ</span>
						per event
					</div>
				</div>
				<div :class="$style.stat">
					<div :class="$style.stat_name">Last month</div>
					<div :class="$style.stat_value">
						{{ statistics.month.value.toFixed(0) }} ꜩ
					</div>
					<div :class="$style.stat_avg">
						Avg
						<span>{{ statistics.month.avg.toFixed(0) }} ꜩ</span>
						per event
					</div>
				</div>
				<div :class="$style.stat">
					<div :class="$style.stat_name">All time</div>
					<div :class="$style.stat_value">
						{{ statistics.all.value.toFixed(0) }} ꜩ
					</div>
					<div :class="$style.stat_avg">
						Avg
						<span>{{ statistics.all.avg.toFixed(0) }} ꜩ</span> per
						event
					</div>
				</div>
			</div>

			<div :class="$style.hint">
				<Icon name="help" size="14" />
				<span>Last week & Last month</span>
				- here we mean a week from the current day minus 7 days / 30
				days
			</div>
		</div>

		<div :class="$style.block">
			<div :class="$style.header">
				<div :class="$style.left">
					<h2>Outstanding balances</h2>
					<div :class="$style.description">
						List of events holding your unclaimed profits
					</div>
				</div>

				<Button
					@click="showWithdrawAllModal = true"
					:type="
						positionsForWithdraw.length ? 'success' : 'secondary'
					"
					size="small"
					:disabled="!positionsForWithdraw.length"
					>Withdraw all</Button
				>
			</div>

			<div v-if="positionsForWithdraw.length" :class="$style.items">
				<EventCard
					v-for="position in paginatedPositionsForWithdraw"
					:key="position.event.id"
					:event="position.event"
					won
				/>
			</div>
			<div v-else :class="$style.empty">
				<Banner
					:loading="accountStore.isPositionsLoading"
					icon="help"
					color="gray"
				>
					{{
						accountStore.isPositionsLoading
							? "Fetching your positions"
							: "No positions for withdraw"
					}}
				</Banner>
			</div>

			<Pagination
				v-if="
					!accountStore.isPositionsLoading &&
					positionsForWithdraw.length > 6
				"
				v-model="currentPageForPositions"
				:total="positionsForWithdraw.length"
				:limit="6"
				:class="$style.pagination"
			/>
		</div>

		<div :class="$style.block">
			<h2>Withdrawal history</h2>
			<div :class="$style.description">Claimed profits</div>

			<div :class="$style.withdrawboard">
				<table v-if="withdrawalsHistory.length">
					<tr>
						<th @click="sortBy('date')">
							withdraw
							<Icon
								v-if="sort.date !== 'default'"
								name="arrow_down"
								size="10"
								:class="[
									$style.sort_icon,
									sort.date == 'asc' && $style.reverse,
								]"
							/>
						</th>
						<th @click="sortBy('amount')">
							amount
							<Icon
								v-if="sort.amount !== 'default'"
								name="arrow_down"
								size="10"
								:class="[
									$style.sort_icon,
									sort.amount == 'asc' && $style.reverse,
								]"
							/>
						</th>
						<th>event</th>
						<th>type</th>
					</tr>

					<tr
						v-for="withdraw in paginatedWithdrawalsHistory"
						:key="withdraw.id"
						@click="handleSelectWithdraw(withdraw)"
						:class="$style.row"
					>
						<td>
							<div :class="$style.user">
								<div :class="$style.money_icon">
									<Icon name="money" size="16" />
								</div>

								<div :class="$style.info">
									<div :class="$style.name">
										Withdraw
										<span
											>#{{
												numberWithSymbol(
													withdraw.id,
													",",
												)
											}}</span
										>
									</div>
									<div :class="$style.tier">
										{{
											DateTime.fromISO(
												withdraw.event.closedOracleTime,
											).toFormat("d LLLL yyyy, T")
										}}
									</div>
								</div>
							</div>
						</td>
						<td>
							+{{
								numberWithSymbol(
									withdraw.amount.toFixed(2),
									",",
								)
							}}
							<span>ꜩ</span>
						</td>
						<td>
							<router-link :to="`/events/${withdraw.event.id}`">
								Event
								<span>#{{ withdraw.event.id }}</span>
							</router-link>
						</td>
						<td>
							{{
								withdraw.type == "MANUAL"
									? "Manual"
									: "Third party"
							}}
						</td>
					</tr>
				</table>

				<div :class="$style.bottom">
					<span>{{ withdrawalsHistory.length }} withdrawals</span>

					<div
						v-if="withdrawalsHistory.length"
						:class="$style.tb_pagination"
					>
						<div
							v-for="page in Math.ceil(
								withdrawalsHistory.length / 5,
							)"
							:key="page"
							@click="currentPageHistory = page"
							:class="[
								$style.page,
								currentPageHistory == page && $style.current,
							]"
						>
							{{ page }}
						</div>
					</div>
				</div>
			</div>

			<div :class="$style.hint">
				<Icon name="help" size="14" />You can withdraw your funds
				manually, however if not done within 24 hours, Juster will do
				that for you and charge a small fee.
			</div>
		</div>
	</div>
</template>

<style module>
.wrapper {
	display: flex;
	flex-direction: column;
	gap: 40px;
}

.block {
}

.description {
	font-size: 14px;
	line-height: 1.6;
	font-weight: 500;
	color: var(--text-tertiary);

	margin-top: 6px;
	margin-bottom: 24px;
}

.header {
	display: flex;
	justify-content: space-between;
}

.stats {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 24px;
}

.stat {
	flex: 1;

	border: 1px solid var(--border);
	border-radius: 10px;
	padding: 24px;
}

.stat_name {
	font-size: 14px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-tertiary);
}

.stat_value {
	font-size: 24px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-primary);

	margin-top: 16px;
	margin-bottom: 10px;
}

.stat_avg {
	font-size: 11px;
	line-height: 1;
	font-weight: 700;
	color: var(--text-tertiary);
	text-transform: uppercase;
}

.stat_avg span {
	color: var(--text-secondary);
}

.withdrawboard {
	border-radius: 8px;
	border: 1px solid var(--border);
	background: var(--card-bg);
}

.withdrawboard table {
	width: 100%;

	border-spacing: 0;
}

.withdrawboard tr {
	display: flex;
	padding: 16px 20px;
	border-bottom: 1px solid var(--border);
}

.row {
	cursor: pointer;

	transition: all 0.2s ease;
}

.row:hover {
	background: rgba(255, 255, 255, 0.03);
}

.withdrawboard th {
	text-transform: uppercase;
	font-size: 12px;
	line-height: 1;
	font-weight: 700;
	color: var(--text-tertiary);

	cursor: pointer;

	display: flex;
	flex: 1;
	align-items: center;
}

.withdrawboard td {
	display: flex;
	align-items: center;
	gap: 4px;

	font-size: 14px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-primary);
	fill: var(--text-tertiary);

	flex: 1;
	padding: 0;
}

.withdrawboard td span {
	color: var(--text-tertiary);
}

.sort_icon {
	fill: var(--blue);

	margin-left: 6px;

	transition: transform 0.2s ease;
}

.sort_icon.reverse {
	transform: rotate(180deg);
}

.bottom {
	display: flex;
	justify-content: space-between;
	align-items: center;

	font-size: 12px;
	line-height: 1;
	font-weight: 500;
	color: var(--text-tertiary);

	padding: 16px 20px;
}

.user {
	display: flex;
	align-items: center;
	gap: 14px;
}

.money_icon {
	width: 32px;
	height: 32px;
	border-radius: 8px;
	background: rgba(255, 255, 255, 0.05);
	fill: var(--icon);

	display: flex;
	align-items: center;
	justify-content: center;
}

.name {
	font-size: 13px;

	margin-bottom: 6px;
}

.name span {
	color: var(--text-tertiary);
}

.tier {
	font-size: 12px;
	line-height: 1;
	font-weight: 500;
	color: var(--text-tertiary);
}

.hint_block {
	display: flex;
	gap: 12px;

	margin-bottom: 60px;
}

.hint_block svg {
	fill: var(--icon);
}

.hint {
	display: flex;
	align-items: center;
	gap: 8px;

	font-size: 12px;
	font-weight: 500;
	line-height: 1.6;
	color: var(--text-tertiary);
	fill: var(--text-tertiary);

	margin-top: 12px;
}

.hint span {
	font-weight: 600;
	color: var(--text-secondary);
}

.items {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
	grid-gap: 16px;
}

.empty {
	display: flex;
	align-items: center;
	gap: 8px;

	font-size: 14px;
	line-height: 1.6;
	color: var(--text-tertiary);
	fill: var(--text-tertiary);
}

.pagination {
	margin-top: 24px;
}

.tb_pagination {
	display: flex;
	align-items: center;
	gap: 6px;
}

.page {
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;

	font-size: 12px;

	width: 24px;
	height: 20px;
	border-radius: 5px;
	background: var(--opacity-05);

	transition: all 0.2s ease;
}

.page.current {
	color: var(--text-primary);
	background: var(--opacity-10);
}

.page:hover {
	background: var(--opacity-10);
}
</style>
