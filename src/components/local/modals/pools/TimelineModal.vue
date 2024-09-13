<script setup>
/**
 * Vendor
 */
import { ref, watch, computed, onMounted } from "vue"
import { DateTime } from "luxon"
import { useRouter } from "vue-router"
import { Searcher } from "fast-fuzzy"

/**
 * UI
 */
import Modal from "@ui/Modal.vue"
import Banner from "@ui/Banner.vue"
import Input from "@ui/Input.vue"
import Spin from "@ui/Spin.vue"

/**
 * Services
 */
import { parsePoolName, shorten } from "@utils/misc"
import { juster, destroySubscription } from "@sdk"
import { token } from "@config"

/**
 * Models
 */
import { poolState as poolStateModel } from "@/graphql/models"

const props = defineProps({
	show: Boolean,
	pool: Object,
})

const emit = defineEmits(["onClose"])

const router = useRouter()

const subscription = ref({})
const events = ref([])

const searchText = ref("")
const eventsSearcher = ref({})

const filteredEvents = computed(() => {
	if (searchText.value) {
		let findedEvents = eventsSearcher.value
			.search(searchText.value.toString().toLowerCase(), {
				returnMatchData: true,
			})
			.map((el) => el.item)

		return findedEvents
	} else {
		return events.value
	}
})

const labelInterval = ref(null)
const delayBeforeNextEventLabel = ref("")

watch(
	() => events.value,
	() => {
		if (!events.value.length) return

		eventsSearcher.value = new Searcher(events.value, {
			keySelector: (item) => {
				return `${item.action.replace("_", " ").toLowerCase()} ${item.affectedEventId} ${
					item.affectedUserId ? item.affectedUserId : ""
				}`
			},
			threshold: 0.8,
		})

		delayBeforeNextEventLabel.value = DateTime.now().diff(DateTime.fromISO(events.value[0].timestamp)).toFormat("hh:mm:ss")
		labelInterval.value = setInterval(() => {
			delayBeforeNextEventLabel.value = DateTime.now().diff(DateTime.fromISO(events.value[0].timestamp)).toFormat("hh:mm:ss")
		}, 1000)
	},
)

watch(
	() => props.show,
	async () => {
		if (props.show) {
			subscription.value = await juster.gql
				.subscription({
					poolState: [
						{
							where: {
								poolId: {
									_eq: props.pool.address,
								},
							},
							limit: 12,
							order_by: {
								counter: "desc",
							},
						},
						poolStateModel,
					],
				})
				.subscribe({
					next: ({ poolState }) => {
						events.value = poolState
					},
					error: console.error,
				})
		} else {
			destroySubscription(subscription.value)
			clearInterval(labelInterval.value)
		}
	},
)

const getEventIconByActionName = (action) => {
	if (action === "EVENT_CREATED") {
		return "plus_circle"
	}
	if (action === "EVENT_FINISHED") {
		return "flag"
	}
	if (action === "USER_DEPOSITED") {
		return "coins_plus"
	}
	if (action === "USER_CLAIMED") {
		return "checkcircle"
	}
	if (action === "USER_WITHDRAWN") {
		return "money"
	}
	if (action === "LIQUIDITY_APPROVED") {
		return "checkcircle"
	}

	return "help"
}
</script>

<template>
	<Modal new :show="show" width="550" closable disableTrap @onClose="emit('onClose')">
		<Flex align="center" justify="between" :class="$style.head">
			<Flex align="center" gap="8">
				<Icon name="bolt" size="16" color="secondary" />
				<Text size="14" weight="600" color="primary">Pool timeline</Text>
			</Flex>

			<Icon @click="emit('onClose')" name="close" size="16" color="tertiary" :class="$style.close_icon" />
		</Flex>

		<Flex direction="column" gap="32" :class="$style.base">
			<Text size="13" weight="500" color="tertiary" height="16">
				A live list of recent events with the selected pool.<br />Use the search for quick access to the desired action.
			</Text>

			<Flex direction="column" gap="20">
				<Flex direction="column" gap="16">
					<Flex align="center" gap="12">
						<Text size="14" weight="600" color="primary">
							{{ parsePoolName(pool.name.replace("Juster Pool: ", "")) }}
						</Text>

						<Text size="12" weight="500" color="support"> ✦ </Text>

						<Flex align="center" gap="4">
							<Icon
								:name="!pool.isDepositPaused ? 'zap_circle' : 'pause'"
								size="12"
								:color="!pool.isDepositPaused ? 'green' : 'yellow'"
							/>
							<Text size="12" weight="600" :color="!pool.isDepositPaused ? 'green' : 'yellow'">
								{{ !pool.isDepositPaused ? "Active" : "Paused" }}
							</Text>
						</Flex>
					</Flex>

					<Input
						v-model="searchText"
						size="small"
						placeholder="Search event by action name, user address or event ID"
						icon="search"
						cleanable
					/>

					<div :class="$style.divider" />
				</Flex>

				<Flex direction="column" gap="12" :class="$style.events">
					<Flex v-if="events.length" align="center" gap="16">
						<Text size="13" weight="500" color="tertiary" align="right" :class="$style.when">
							{{ delayBeforeNextEventLabel }}
						</Text>

						<Flex align="center" gap="8">
							<div :class="$style.dot" />

							<Text size="14" weight="500" color="tertiary"> Waiting for next event... </Text>
						</Flex>
					</Flex>
					<Flex v-else align="center" gap="16">
						<Text size="13" weight="500" color="tertiary" align="right" :class="$style.when">Fetching</Text>

						<Flex align="center" gap="8">
							<Spin size="14" />

							<Text size="14" weight="500" color="tertiary"></Text>
						</Flex>
					</Flex>

					<div v-if="filteredEvents.length" :class="$style.line" />

					<Flex v-for="(ev, idx) in filteredEvents" direction="column" gap="12">
						<Flex align="center" gap="16">
							<Text size="13" weight="500" color="tertiary" align="right" :class="$style.when">
								{{ DateTime.fromISO(ev.timestamp).toFormat("HH:mm") }}
							</Text>

							<Flex align="center" gap="8">
								<Icon :name="getEventIconByActionName(ev.action)" size="14" color="secondary" />

								<Text size="14" weight="600" color="primary" :class="$style.action_name">
									{{ ev.action.toLowerCase().replace("_", " ") }}
								</Text>
							</Flex>
						</Flex>

						<div v-if="idx !== events.length - 1" :class="$style.line">
							<svg
								v-if="['EVENT_FINISHED', 'USER_DEPOSITED', 'LIQUIDITY_APPROVED'].includes(ev.action)"
								width="17"
								height="17"
								viewBox="0 0 17 17"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								:class="$style.line_arrow"
							>
								<path d="M1 0V6C1 11.5228 5.47715 16 11 16H17" stroke="#2E2E31" stroke-width="2" />
							</svg>

							<Flex
								v-if="ev.action === 'EVENT_FINISHED'"
								align="center"
								gap="14"
								@click="router.push(`/events/${ev.affectedEventId}`)"
								:class="$style.line_card"
							>
								<Icon name="price_event" size="16" color="secondary" />

								<Flex direction="column" gap="6">
									<Text size="12" weight="600" color="primary">
										{{ parsePoolName(pool.name.replace("Juster Pool: ", "")) }}
									</Text>

									<Flex align="center" gap="4" :class="$style.params">
										<Text size="12" weight="500" color="tertiary">Provided: </Text>
										<Text size="12" weight="500" color="secondary"
											>{{ ev.affectedEvent.provided.toFixed(2) }}&nbsp;&nbsp;</Text
										>
										<Text size="12" weight="500" color="tertiary">Result: </Text>
										<Text size="12" weight="500" color="secondary"
											>{{ ev.affectedEvent.result.toFixed(2) }}&nbsp;&nbsp;</Text
										>
										<Text size="12" weight="500" color="tertiary">Diff: </Text>

										<Text
											size="12"
											weight="500"
											:color="ev.affectedEvent.result - ev.affectedEvent.provided < 0 ? 'orange' : 'green'"
										>
											{{
												(100 * Math.abs(ev.affectedEvent.provided - ev.affectedEvent.result)) /
													((ev.affectedEvent.provided + ev.affectedEvent.result) / 2) <
												0.01
													? "<"
													: ""
											}}{{
												(100 * Math.abs(ev.affectedEvent.provided - ev.affectedEvent.result)) /
													((ev.affectedEvent.provided + ev.affectedEvent.result) / 2) <
												0.01
													? "0.01"
													: (
															(100 * Math.abs(ev.affectedEvent.provided - ev.affectedEvent.result)) /
															((ev.affectedEvent.provided + ev.affectedEvent.result) / 2)
													  ).toFixed(2)
											}}%
										</Text>
									</Flex>
								</Flex>
							</Flex>

							<Flex
								v-if="ev.action === 'USER_DEPOSITED'"
								@click="router.push(`/profile/${ev.affectedUserId}`)"
								align="center"
								gap="14"
								:class="$style.line_card"
							>
								<img
									:src="`https://services.tzkt.io/v1/avatars/${ev.affectedUserId}`"
									alt="avatar"
									:class="$style.avatar"
								/>

								<Flex direction="column" gap="6">
									<Flex>
										<Text size="12" weight="600" color="primary">{{ ev.affectedEntry.amount }}&nbsp;</Text>
										<Text size="12" weight="600" color="tertiary">{{token.symbol}}</Text>
									</Flex>

									<Flex align="center" gap="4" :class="$style.params">
										<Text size="12" weight="500" color="tertiary">{{ shorten(ev.affectedUserId, 6, 12) }}</Text>
									</Flex>
								</Flex>
							</Flex>

							<Flex
								v-if="ev.action === 'LIQUIDITY_APPROVED'"
								@click="router.push(`/profile/${ev.affectedUserId}`)"
								align="center"
								gap="14"
								:class="$style.line_card"
							>
								<Icon name="check" size="16" color="secondary" />

								<Flex direction="column" gap="6">
									<Flex>
										<Text size="12" weight="600" color="secondary">Plus&nbsp;</Text>
										<Text size="12" weight="600" color="primary">{{ ev.totalLiquidityDiff }}</Text>
										<Text size="12" weight="600" color="secondary">&nbsp;{{token.symbol}}</Text>
									</Flex>

									<Flex align="center" gap="4" :class="$style.params">
										<Text size="12" weight="500" color="tertiary">Total: </Text>
										<Text size="12" weight="500" color="secondary">{{ ev.totalLiquidity.toFixed(2) }}&nbsp;&nbsp;</Text>
										<Text size="12" weight="500" color="tertiary">From: </Text>
										<Text size="12" weight="500" color="secondary">
											{{ shorten(ev.affectedUserId, 4, 6) }}
										</Text>
									</Flex>
								</Flex>
							</Flex>
						</div>
					</Flex>
				</Flex>

				<Flex direction="column" gap="16">
					<div :class="$style.divider" />
					<Banner color="gray">Only 12 recent events are supported</Banner>
				</Flex>
			</Flex>
		</Flex>
	</Modal>
</template>

<style module>
.head {
	height: 56px;

	padding: 0 20px;
}

.close_icon {
	cursor: pointer;
}

.base {
	padding: 0px 20px 20px 20px;
}

.divider {
	width: 100%;
	height: 0px;

	border: 1px dashed var(--opacity-05);
}

.when {
	min-width: 80px;
}

.action_name {
	text-transform: capitalize;
}

.dot {
	width: 4px;
	height: 4px;
	border-radius: 50px;
	background: var(--text-secondary);

	margin: 0 5px;

	box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.5);
	transform: scale(1);
	animation: pulse 2s infinite;
}

@keyframes pulse {
	0% {
		transform: scale(0.95);
		box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.5);
	}

	70% {
		transform: scale(1);
		box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
	}

	100% {
		transform: scale(0.95);
		box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
	}
}

.events {
	max-height: 400px;
	overflow-y: auto;
	padding: 8px 0;
}

.line {
	position: relative;

	border-left: 2px solid var(--opacity-05);

	min-height: 24px;

	margin-left: 102px;
}

.line_arrow {
	position: absolute;
	top: 43%;
	left: -2px;

	transform: translateY(-50%);
}

.line_card {
	width: fit-content;
	height: 58px;

	cursor: pointer;
	background: rgba(0, 0, 0, 0.1);
	border-radius: 8px;
	border: 2px solid var(--opacity-05);

	margin: 16px 16px 16px 14px;
	padding: 0 14px;
}

.avatar {
	width: 16px;
	height: 16px;
}

@media (max-width: 600px) {
	.line_card {
		flex-direction: column;
		align-items: flex-start;

		height: initial;

		padding: 16px;
	}

	.when {
		min-width: 60px;
	}

	.params {
		flex-direction: column;
		align-items: flex-start;
		gap: 8px;
	}

	.line {
		margin-left: 82px;
	}
}
</style>
