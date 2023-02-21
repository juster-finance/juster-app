<script setup>
/**
 * Vendor
 */
import { ref, onMounted, watch, computed } from "vue"
import { DateTime, Duration } from "luxon"
import BN from "bignumber.js"

/**
 * UI
 */
import Spin from "@ui/Spin.vue"
import Button from "@ui/Button.vue"
import Tooltip from "@ui/Tooltip.vue"
import LargeBanner from "@ui/LargeBanner.vue"

/**
 * Services
 */
import { juster } from "@sdk"
import { getCurrencyIcon, parsePoolName } from "@utils/misc"
import { numberWithSymbol, truncate } from "@utils/amounts"
import { supportedMarkets } from "@config"

/**
 * Store
 */
import { useAccountStore } from "@store/account"

const accountStore = useAccountStore()

const emit = defineEmits([
	"onDepositLiquidity",
	"onGetClaims",
	"onManualEntryApprove",
	"onRequestWithdraw",
])
const props = defineProps({
	title: { type: String, default: "My Funds" },
	pools: Array,
	poolsStates: Object,
	summaries: Object,
	entries: Array,
	positions: Array,
	poolDuration: Number,
	isReady: Boolean,
})

onMounted(async () => {
	if (line.value && props.pools.length === 1) getCurrencyPair()
})

const showEntries = ref(false)
const togglePendingEntries = () => {
	showEntries.value = !showEntries.value
}

const showClaims = ref(false)
const togglePendingClaims = () => {
	showClaims.value = !showClaims.value
}

const isDepositAvailable = computed(() => {
	return (
		props.pools.length > 0 &&
		props.pools.length === Object.keys(props.poolsStates).length &&
		accountStore.pkh.length
	)
})

const handleDepositLiquidityClick = () => {
	if (!isDepositAvailable.value || !parseFloat(accountStore.balance)) return
	emit("onDepositLiquidity")
}

const valueLocked = computed(() => {
	if (!props.positions.length) return 0
	if (!props.isReady) return 0

	return props.positions
		.reduce((acc, curr) => {
			return acc.plus(
				curr.shares.multipliedBy(
					props.poolsStates[curr.poolId].sharePrice,
				),
			)
		}, BN(0))
		.toNumber()
})

const isEntryReadyToManualApprove = (entry) => {
	if (entry.status !== "PENDING") return
	return (
		entry.amount < 1 &&
		DateTime.fromISO(entry.acceptTime).plus({
			seconds: entry.pool.entryLockPeriod,
		}).ts < DateTime.now().ts
	)
}

const pendingEntries = computed(() =>
	props.entries.filter(
		(entry) => entry.status === "PENDING" && entry.amount >= 1,
	),
)

const manualEntries = computed(() =>
	props.entries.filter((e) => isEntryReadyToManualApprove(e)),
)

const unrealizedProfit = computed(() => {
	let profit = 0

	Object.keys(props.summaries).forEach((pool) => {
		const summary = props.summaries[pool]
		profit += summary.unrealizedProfit.toNumber()
	})

	return profit
})

/**
 * Claims
 */
const availableClaims = computed(() => {
	let claims = []

	if (!props.positions.length) return []

	props.positions.forEach((position) => {
		claims = [
			...claims,
			...position.claims.filter(
				(claim) => claim.event.result && !claim.withdrawn,
			),
		]
	})
	return claims
})

const pendingClaims = computed(() => {
	let claims = []
	props.positions.forEach((position) => {
		claims = [
			...claims,
			...position.claims.filter((claim) => !claim.event.result),
		]
	})
	return claims
})

const allClaims = computed(() => [
	...availableClaims.value,
	...pendingClaims.value,
])

const oldestClaim = computed(() => {
	if (!availableClaims.value.length) return

	const claim = availableClaims.value.sort((a, b) => {
		const { betsCloseTime: aBetsCloseTime, measurePeriod: aMeasurePeriod } =
			a.event.event
		const { betsCloseTime: bBetsCloseTime, measurePeriod: bMeasurePeriod } =
			b.event.event

		const aDiff = DateTime.now()
			.diff(
				DateTime.fromISO(aBetsCloseTime).plus(aMeasurePeriod * 1000),
				["days"],
			)
			.toObject()
		const bDiff = DateTime.now()
			.diff(
				DateTime.fromISO(bBetsCloseTime).plus(bMeasurePeriod * 1000),
				["days"],
			)
			.toObject()

		return bDiff.days - aDiff.days
	})[0]

	let days = 0
	const { betsCloseTime, measurePeriod } = claim.event.event
	days = DateTime.now()
		.diff(DateTime.fromISO(betsCloseTime).plus(measurePeriod * 1000), [
			"days",
		])
		.toObject().days

	return { data: claim, days }
})

const line = computed(() => {
	return props.pools[0]?.poolLines[0]
})

const currencyPair = ref({})
const isCurrencyPairFetched = ref(false)
const getCurrencyPair = async () => {
	isCurrencyPairFetched.value = true
	const { currencyPairByPk } = await juster.gql.query({
		currencyPairByPk: [
			{
				id: line.value.currencyPairId,
			},
			{
				id: true,
				totalEvents: true,
				symbol: true,
			},
		],
	})

	currencyPair.value = currencyPairByPk
}

const getClaimReadyTime = (claim) => {
	const { betsCloseTime, measurePeriod } = claim.event.event

	const endDt = DateTime.fromISO(betsCloseTime).plus(measurePeriod * 1000)
	const diff = endDt
		.setLocale("en")
		.diff(DateTime.now(), ["hours", "minutes"])

	return {
		diff,
		text:
			diff.toObject().hours >= 1
				? `${diff.toObject().hours.toFixed(0)}h`
				: `${
						diff.toObject().minutes > 0
							? diff.toObject().minutes.toFixed(0)
							: 0
				  }m`,
	}
}

const handleGetClaims = () => {
	emit(
		"onGetClaims",
		allClaims.value.filter((claim) => claim.event.result),
	)
}

const parseSensitiveAmount = (amount) => {
	if (
		Math.abs(amount % 1) < 0.01 &&
		amount !== 0 &&
		amount < 0.01 &&
		amount > -0.01
	) {
		return truncate(amount)
	} else {
		return numberWithSymbol(amount, ",")
	}
}

watch(
	() => line.value,
	() => {
		if (
			!isCurrencyPairFetched.value &&
			line.value &&
			props.pools.length === 1
		) {
			getCurrencyPair()
		}
	},
)
</script>

<template>
	<div :class="$style.wrapper">
		<Flex align="center" justify="between" :class="$style.head">
			<Text color="primary" size="16" weight="600">{{ title }}</Text>
		</Flex>

		<Flex v-if="currencyPair.symbol" :class="$style.pool_line">
			<Flex align="center" gap="14" :class="$style.badge">
				<div :class="$style.currency">
					<img
						:src="
							getCurrencyIcon(currencyPair.symbol.split('-')[0])
						"
						alt="symbol"
					/>
				</div>

				<Flex direction="column" gap="8">
					<Text color="primary" size="16" weight="600">
						{{ supportedMarkets[currencyPair.symbol].description }}
					</Text>

					<Flex align="center" gap="12">
						<Flex align="center" gap="6">
							<Icon
								name="price_event"
								size="12"
								color="support"
							/>
							<Text size="13" weight="600" color="tertiary">
								{{ line.maxEvents }} events
							</Text>
						</Flex>

						<Flex v-if="poolDuration" align="center" gap="6">
							<Icon name="time" size="12" color="support" />

							<Text size="13" weight="600" color="tertiary">
								{{
									Duration.fromObject({
										seconds: poolDuration,
									})
										.reconfigure({ locale: "en" })
										.rescale()
										.toHuman({ unitDisplay: "long" })
								}}
							</Text>
						</Flex>
					</Flex>
				</Flex>
			</Flex>
		</Flex>

		<Flex
			align="center"
			gap="32"
			:class="[
				$style.funds,
				!valueLocked && !unrealizedProfit && $style.opacity,
			]"
		>
			<Flex align="center" gap="14" :class="$style.badge">
				<Icon
					name="coins"
					size="20"
					color="secondary"
					:class="$style.icon"
				/>

				<Flex direction="column" gap="8">
					<Text color="primary" size="16" weight="600">
						{{ parseSensitiveAmount(valueLocked) }}
					</Text>
					<Text
						color="tertiary"
						size="13"
						weight="500"
						:class="$style.badge__subtitle"
					>
						Total Value Locked
					</Text>
				</Flex>
			</Flex>

			<Flex align="center" gap="14" :class="$style.badge">
				<Icon
					name="coins_plus"
					size="20"
					:color="unrealizedProfit > 0 ? 'green' : 'secondary'"
					:class="$style.icon"
				/>

				<Flex direction="column" gap="8">
					<Text color="primary" size="16" weight="600">
						{{ parseSensitiveAmount(unrealizedProfit) }}
					</Text>
					<Text
						color="tertiary"
						size="13"
						weight="500"
						:class="$style.badge__subtitle"
					>
						Unrealized Profit
					</Text>
				</Flex>
			</Flex>
		</Flex>

		<Flex direction="column" gap="24">
			<LargeBanner
				v-if="
					!valueLocked &&
					!unrealizedProfit &&
					!pendingEntries.length &&
					isReady &&
					pools.length > 1
				"
				title="Start using Liquidity Pools today"
				description="It only takes a few minutes to learn this feature with
						the help of detailed documentation and guides."
				:icon="{ name: 'Book', color: 'orange' }"
			>
				<template #buttons>
					<router-link to="/docs/pools">
						<Text size="13" weight="600" color="blue">
							Getting Started
						</Text>
					</router-link>
				</template>
			</LargeBanner>

			<Flex
				v-if="pendingEntries.length || manualEntries.length"
				direction="column"
				gap="12"
				:class="$style.progress"
			>
				<Flex
					@click="togglePendingEntries()"
					direction="column"
					gap="12"
				>
					<Flex align="center" justify="between" wide>
						<Tooltip placement="top-start" text-align="left">
							<Flex align="center" gap="6">
								<Text size="14" color="secondary" weight="600">
									Pending Entries
								</Text>

								<Icon
									:name="
										manualEntries.length
											? 'warning'
											: 'help'
									"
									size="14"
									:color="
										manualEntries.length
											? 'orange'
											: 'support'
									"
								/>
							</Flex>

							<template #content>
								<Flex
									v-if="!manualEntries.length"
									direction="column"
									gap="6"
								>
									Your deposits awaiting confirmation
									<span>
										This may take some time depending on<br />the
										selected pool, or rather its period
									</span>
								</Flex>
								<Flex v-else direction="column" gap="6">
									One (or more) entries need manual
									confirmation
									<span>
										This is due to the fact that the
										amount<br />
										of the deposit was less than one tezos
									</span>
								</Flex>
							</template>
						</Tooltip>

						<Flex align="center" gap="4">
							<Text size="14" color="tertiary" weight="600">
								{{
									pendingEntries.length + manualEntries.length
								}}
								{{
									pendingEntries.length +
										manualEntries.length ==
									1
										? "entry"
										: "entries"
								}}
							</Text>

							<Icon
								name="arrow"
								size="14"
								color="tertiary"
								:style="{
									transform: showEntries
										? `rotate(180deg)`
										: null,
								}"
							/>
						</Flex>
					</Flex>

					<Flex :class="$style.bar">
						<div
							:class="[$style.bar_progress, $style.blue]"
							:style="{
								width: `${
									(pendingEntries.length * 100) /
									(pendingEntries.length +
										manualEntries.length)
								}%`,
							}"
						/>

						<div
							v-if="manualEntries.length"
							:class="[$style.bar_progress, $style.gray]"
							:style="{
								width: `${
									100 -
									(pendingEntries.length * 100) /
										(pendingEntries.length +
											manualEntries.length)
								}%`,
							}"
						/>

						<svg
							width="200%"
							height="12"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							:class="$style.bar_anim"
						>
							<defs>
								<pattern
									id="lines"
									patternUnits="userSpaceOnUse"
									width="20"
									height="12"
								>
									<path
										fill-rule="evenodd"
										clip-rule="evenodd"
										d="M0.240234 12.0001L12.2402 6.10352e-05H20.7255L8.72552 12.0001H0.240234Z"
										fill="white"
										fill-opacity="0.2"
									/>
								</pattern>
							</defs>
							<rect
								width="100%"
								height="100%"
								fill="url(#lines)"
							/>
						</svg>
					</Flex>
				</Flex>

				<Flex v-show="showEntries" direction="column" gap="12">
					<Flex
						v-for="entry in [...pendingEntries, ...manualEntries]"
						justify="between"
						align="center"
					>
						<Flex align="center" gap="8">
							<Spin
								v-if="!isEntryReadyToManualApprove(entry)"
								size="12"
								style="opacity: 0.5"
							/>
							<Icon
								v-else
								name="warning"
								size="12"
								color="tertiary"
							/>

							<Flex align="center">
								<Text size="14" weight="600" color="secondary">
									{{
										parsePoolName(
											entry.pool.name.replace(
												"Juster Pool: ",
												"",
											),
										)
									}}&nbsp;
								</Text>
								<Text size="14" weight="600" color="tertiary">
									#{{ entry.entryId }}
								</Text>
							</Flex>
						</Flex>

						<Text
							v-if="!isEntryReadyToManualApprove(entry)"
							size="14"
							weight="600"
							color="secondary"
						>
							{{ numberWithSymbol(entry.amount, ",") }} ꜩ
						</Text>

						<Text
							v-else
							@click="emit('onManualEntryApprove', entry)"
							size="14"
							weight="600"
							color="blue"
							style="cursor: pointer"
						>
							Approve
							{{ numberWithSymbol(entry.amount, ",") }} ꜩ
						</Text>
					</Flex>
				</Flex>
			</Flex>

			<Flex
				v-if="allClaims.length"
				direction="column"
				gap="12"
				:class="$style.progress"
			>
				<Flex @click="togglePendingClaims" direction="column" gap="12">
					<Flex align="center" justify="between" wide>
						<Tooltip placement="bottom-start" text-align="left">
							<Flex align="center" gap="6">
								<Text size="14" color="secondary" weight="600">
									Pending Claims
								</Text>
								<Icon name="help" size="14" color="support" />
							</Flex>

							<template #content>
								<Flex direction="column" gap="6">
									Your funds are being prepared for withdrawal
									<span>
										You have to wait until the events in
										which<br />
										your funds are used are over
									</span>
								</Flex>
							</template>
						</Tooltip>

						<Flex align="center" gap="4">
							<Text size="14" color="tertiary" weight="600">
								{{ allClaims.length - pendingClaims.length }} of
								{{ allClaims.length }},
							</Text>
							<Text size="14" color="secondary" weight="600">
								{{
									(
										((allClaims.length -
											pendingClaims.length) *
											100) /
										allClaims.length
									).toFixed(0)
								}}%
							</Text>

							<Icon
								name="arrow"
								size="14"
								color="tertiary"
								:style="{
									transform: showClaims
										? `rotate(180deg)`
										: null,
								}"
							/>
						</Flex>
					</Flex>

					<Flex :class="$style.bar">
						<div
							:class="[$style.bar_progress, $style.green]"
							:style="{
								width: `${
									((allClaims.length - pendingClaims.length) *
										100) /
									allClaims.length
								}%`,
							}"
						>
							<svg
								width="200%"
								height="12"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								:class="$style.bar_anim"
							>
								<defs>
									<pattern
										id="lines"
										patternUnits="userSpaceOnUse"
										width="20"
										height="12"
									>
										<path
											fill-rule="evenodd"
											clip-rule="evenodd"
											d="M0.240234 12.0001L12.2402 6.10352e-05H20.7255L8.72552 12.0001H0.240234Z"
											fill="white"
											fill-opacity="0.2"
										/>
									</pattern>
								</defs>
								<rect
									width="100%"
									height="100%"
									fill="url(#lines)"
								/>
							</svg>
						</div>
					</Flex>
				</Flex>

				<Flex v-show="showClaims" direction="column" gap="12">
					<Flex
						v-for="claim in allClaims"
						justify="between"
						align="center"
					>
						<Flex align="center" gap="8">
							<Icon
								v-if="claim.event.result"
								name="check"
								size="12"
								color="green"
							/>
							<Spin v-else size="12" style="opacity: 0.5" />

							<Flex align="center">
								<Text size="14" weight="600" color="secondary">
									Claim&nbsp;
								</Text>
								<Text size="14" weight="600" color="tertiary">
									#{{ numberWithSymbol(claim.eventId, ",") }}
								</Text>
							</Flex>
							<Text
								v-if="!claim.event.result"
								size="14"
								weight="600"
								color="support"
							>
								&nbsp;~{{ getClaimReadyTime(claim).text }}
							</Text>
						</Flex>

						<Flex align="center" gap="4">
							<Text size="14" weight="600" color="secondary">
								{{ numberWithSymbol(claim.amount, ",") }}
							</Text>
							<Text size="14" weight="600" color="tertiary"
								>ꜩ</Text
							>
						</Flex>
					</Flex>
				</Flex>

				<Button
					v-if="allClaims.length - pendingClaims.length"
					@click="handleGetClaims"
					@onKeybind="handleGetClaims"
					type="secondary"
					size="medium"
					block
					keybind="G+C"
				>
					<Icon name="credit_add" size="16" color="green" />
					Withdraw Сlaims
				</Button>
			</Flex>

			<LargeBanner
				v-if="availableClaims.length && oldestClaim.days > 2"
				title="Your funds are waiting to be withdrawn"
				:description="`It looks like your funds are ready for more than
					${oldestClaim.days.toFixed(0)} days, but you still have
					not made a withdrawal.`"
				:icon="{ name: 'money', color: 'green' }"
				:class="$style.large_banner"
			/>

			<Flex direction="column" gap="12">
				<Tooltip
					placement="bottom"
					:button="{
						icon: 'login',
						text: 'Connect Wallet',
						url: '/connect',
						type: 'primary',
					}"
					is-wide
					:disabled="!!accountStore.pkh.length"
				>
					<Button
						@click="handleDepositLiquidityClick"
						@onKeybind="handleDepositLiquidityClick"
						:disabled="
							!isDepositAvailable ||
							!parseFloat(accountStore.balance)
						"
						type="primary"
						size="medium"
						keybind="D+L"
						block
					>
						<Icon name="plus_circle" size="16" />Deposit Liquidity
					</Button>
					<template #content>
						Connect a wallet to make a deposit
					</template>
				</Tooltip>

				<Button
					v-if="pools.length === 1"
					@click="emit('onRequestWithdraw')"
					@onKeybind="emit('onRequestWithdraw')"
					:disabled="!positions.length"
					type="secondary"
					size="medium"
					keybind="R+W"
					block
				>
					<Icon name="money" size="16" />Request Withdrawal
				</Button>
			</Flex>
		</Flex>
	</div>
</template>

<style module>
.wrapper {
	width: 100%;

	border-radius: 8px;
	background: var(--card-bg);
	border-top: 3px solid var(--border);

	padding: 24px;
}

.head {
	border-bottom: 1px solid var(--border);

	padding-bottom: 20px;
}

.pool_line {
	border-bottom: 1px solid var(--border);

	padding: 24px 0;
}

.funds {
	border-bottom: 1px solid var(--border);

	padding: 24px 0;
	margin-bottom: 24px;

	transition: opacity 0.2s ease;
}

.funds.opacity {
	opacity: 0.5;
}

.funds:hover {
	opacity: 1;
}

.badge .icon {
	box-sizing: content-box;
	border-radius: 8px;
	background: rgba(255, 255, 255, 0.05);

	padding: 12px;
}

.badge .currency {
	box-sizing: content-box;
	border-radius: 8px;
	background: rgba(255, 255, 255, 0.05);

	padding: 12px;
}

.badge .currency img {
	display: flex;
	width: 20px;
	height: 20px;

	border-radius: 50%;
}

.badge__subtitle {
	white-space: nowrap;
}

.progress {
	cursor: pointer;
}

.bar {
	position: relative;

	height: 12px;
	border-radius: 3px;
	background: rgba(255, 255, 255, 0.05);

	overflow: hidden;
}

.bar_progress {
	position: relative;
	overflow: hidden;

	width: 100%;
	height: 100%;

	transition: width 1s var(--bezier);
}

.bar_progress.blue {
	background: var(--blue);
}

.bar_progress.green {
	background: var(--green);
}

.bar_progress.gray {
	background: var(--opacity-10);
}

.bar_anim {
	position: absolute;

	top: 0;
	left: 0;

	animation: mig 36s infinite linear;
}

@keyframes mig {
	0% {
		transform: translateX(0);
	}
	50% {
		transform: translateX(-200px);
	}
	100% {
		transform: translateX(0);
	}
}

@media (max-width: 500px) {
	.funds {
		flex-direction: column;
		align-items: flex-start;
		gap: 16px;
	}
}
</style>
