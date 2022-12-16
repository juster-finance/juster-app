<script setup>
/**
 * Vendor
 */
import { ref, computed } from "vue"
import { DateTime } from "luxon"

/**
 * UI
 */
import Spin from "@ui/Spin.vue"
import Button from "@ui/Button.vue"
import Tooltip from "@ui/Tooltip.vue"

/**
 * Services
 */
import { numberWithSymbol } from "@utils/amounts"

const emit = defineEmits(["onDepositLiquidity", "onGetClaims"])
const props = defineProps({
	pools: Array,
	poolsStates: Object,
	entries: Array,
	positions: Array,
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
		props.pools.length > 1 &&
		props.pools.length === Object.keys(props.poolsStates).length
	)
})

const handleDepositLiquidityClick = () => {
	if (!isDepositAvailable.value) return
	emit("onDepositLiquidity")
}

const valueLocked = computed(() =>
	props.positions.reduce(
		(acc, curr) => (acc = acc + curr.depositedAmount),
		0,
	),
)

const pendingEntries = computed(() =>
	props.entries.filter((entry) => entry.status === "PENDING"),
)

/**
 * Claims
 */
const availableClaims = computed(() => {
	let claims = []
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
</script>

<template>
	<div :class="$style.wrapper">
		<Flex align="center" justify="between" :class="$style.head">
			<Text color="primary" size="16" weight="600">My Funds</Text>
		</Flex>

		<Flex align="center" gap="32" :class="$style.funds">
			<Flex align="center" gap="14" :class="$style.badge">
				<Icon
					name="coins"
					size="20"
					color="secondary"
					:class="$style.icon"
				/>

				<Flex direction="column" gap="8">
					<Text color="primary" size="16" weight="600">
						{{ valueLocked.toFixed(2) }}
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
					color="green"
					:class="$style.icon"
				/>

				<Flex direction="column" gap="8">
					<Text color="primary" size="16" weight="600">0.00</Text>
					<Text
						color="tertiary"
						size="13"
						weight="500"
						:class="$style.badge__subtitle"
					>
						Available Income
					</Text>
				</Flex>
			</Flex>
		</Flex>

		<Flex
			v-if="pendingEntries.length"
			@click="togglePendingEntries()"
			direction="column"
			gap="12"
			:class="$style.progress"
		>
			<Flex align="center" justify="between" wide>
				<Tooltip placement="top-start" text-align="left">
					<Flex align="center" gap="6">
						<Text size="14" color="secondary" weight="600">
							Pending Entries
						</Text>

						<Icon name="help" size="14" color="support" />
					</Flex>

					<template #content>
						<Flex direction="column" gap="6">
							Your deposits awaiting confirmation
							<span>
								This may take some time depending on<br />the
								selected pool, or rather its period
							</span>
						</Flex>
					</template>
				</Tooltip>

				<Flex align="center" gap="4">
					<Text size="14" color="tertiary" weight="600">
						{{ pendingEntries.length }}
						{{ pendingEntries.length == 1 ? "entry" : "entries" }}
					</Text>

					<Icon name="arrow" size="14" color="tertiary" />
				</Flex>
			</Flex>

			<div :class="$style.bar">
				<div :class="[$style.bar_progress, $style.blue]">
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
						<rect width="100%" height="100%" fill="url(#lines)" />
					</svg>
				</div>
			</div>

			<Flex v-if="showEntries" direction="column" gap="12">
				<Flex
					v-for="entry in pendingEntries"
					justify="between"
					align="center"
				>
					<Flex>
						<Text size="14" weight="600" color="support">—</Text>
						<Text size="14" weight="600" color="secondary">
							&nbsp;Entry #{{ entry.entryId }}
						</Text>
					</Flex>

					<Text size="14" weight="600" color="secondary">
						{{ numberWithSymbol(entry.amount, ",") }} ꜩ
					</Text>
				</Flex>
			</Flex>
		</Flex>

		<Flex
			v-if="allClaims.length"
			@click="togglePendingClaims"
			direction="column"
			gap="12"
			:class="$style.progress"
		>
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
								You have to wait until the events in which<br />
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
								((allClaims.length - pendingClaims.length) *
									100) /
								allClaims.length
							).toFixed(0)
						}}%
					</Text>

					<Icon name="arrow" size="14" color="tertiary" />
				</Flex>
			</Flex>

			<div :class="$style.bar">
				<div
					:class="[$style.bar_progress, $style.green]"
					:style="{
						width: `${
							((allClaims.length - pendingClaims.length) * 100) /
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
						<rect width="100%" height="100%" fill="url(#lines)" />
					</svg>
				</div>
			</div>

			<Flex v-if="showClaims" direction="column" gap="12">
				<Flex
					v-for="claim in allClaims"
					justify="between"
					align="center"
				>
					<Flex align="center" gap="4">
						<Icon
							v-if="claim.event.result"
							name="check"
							size="12"
							color="green"
						/>
						<Spin v-else size="12" style="opacity: 0.5" />
						<Text size="14" weight="600" color="secondary">
							&nbsp;Claim #{{ claim.id }}
						</Text>
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
						<Text size="14" weight="600" color="tertiary">ꜩ</Text>
					</Flex>
				</Flex>
			</Flex>
		</Flex>

		<Flex
			v-if="availableClaims.length && oldestClaim.days > 2"
			gap="12"
			:class="$style.warning_badge"
		>
			<Icon name="money" size="16" color="green" />

			<Flex direction="column" gap="8">
				<Text size="14" weight="600" color="primary">
					Your funds are waiting to be withdrawn
				</Text>
				<Text size="13" weight="500" color="tertiary" height="16">
					It looks like your funds are ready for more than
					{{ oldestClaim.days.toFixed(0) }} days, but you still have
					not made a manual withdrawal.
				</Text>
			</Flex>
		</Flex>

		<Flex direction="column" gap="12" :class="$style.buttons">
			<Button
				@click="handleDepositLiquidityClick"
				@onKeybind="handleDepositLiquidityClick"
				:disabled="!isDepositAvailable"
				type="primary"
				size="medium"
				keybind="D+L"
				block
			>
				<Icon name="plus_circle" size="16" />Deposit Liquidity
			</Button>

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

.funds {
	border-bottom: 1px solid var(--border);

	padding: 24px 0;
}

.badge .icon {
	box-sizing: content-box;
	border-radius: 8px;
	background: rgba(255, 255, 255, 0.05);

	padding: 12px;
}

.badge__subtitle {
	white-space: nowrap;
}

.progress {
	cursor: pointer;

	margin-top: 24px;
}

.bar {
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
	border-radius: 3px;

	transition: width 1s var(--bezier);
}

.bar_progress.blue {
	background: var(--blue);
}

.bar_progress.green {
	background: var(--green);
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

.buttons {
	margin-top: 24px;
}

.warning_badge {
	border-radius: 8px;
	background: var(--app-bg);

	margin-top: 24px;
	padding: 16px;
}

@media (max-width: 500px) {
	.funds {
		flex-direction: column;
		align-items: flex-start;
		gap: 16px;
	}
}
</style>
