<script setup>
/**
 * Vendor
 */
import { ref, computed } from "vue"

/**
 * UI
 */
import Button from "@ui/Button.vue"
import Tooltip from "@ui/Tooltip.vue"

/**
 * Services
 */
import { numberWithSymbol } from "@utils/amounts"

const emit = defineEmits(["onDepositLiquidity"])
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

const pendingEntries = computed(() =>
	props.entries.filter((entry) => entry.status === "PENDING"),
)

const valueLocked = computed(() =>
	props.positions.reduce(
		(acc, curr) =>
			(acc = acc + curr.depositedAmount + curr.lockedEstimateAmount),
		0,
	),
)
</script>

<template>
	<div :class="$style.wrapper">
		<Flex align="center" justify="between" :class="$style.head">
			<Text color="primary" size="16" weight="600">My Funds</Text>

			<Text color="blue" size="14" weight="600"> Request Funds </Text>
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
						{{ valueLocked }}
					</Text>
					<Text
						color="tertiary"
						size="13"
						weight="500"
						:class="$style.badge__subtitle"
					>
						Total Value Used
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
				<div :class="[$style.bar_progress, $style.blue]" />

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

			<Flex v-if="showEntries" direction="column" gap="12">
				<Flex
					v-for="entry in pendingEntries"
					justify="between"
					align="center"
				>
					<Flex>
						<Text size="14" weight="600" color="support">—</Text>
						&nbsp;
						<Text size="14" weight="600" color="secondary">
							Entry #{{ entry.entryId }}
						</Text>
					</Flex>

					<Text size="14" weight="600" color="secondary">
						{{ numberWithSymbol(entry.amount, ",") }} ꜩ
					</Text>
				</Flex>
			</Flex>
		</Flex>

		<Flex direction="column" gap="12" :class="$style.progress">
			<Flex align="center" justify="between" wide>
				<Tooltip placement="bottom-start" text-align="left">
					<Flex align="center" gap="6">
						<Text size="14" color="secondary" weight="600">
							Progress of Claims
						</Text>
						<Icon name="help" size="14" color="support" />
					</Flex>

					<template #content>
						<Flex direction="column" gap="6">
							Your funds are being prepared for withdrawal
							<span>
								You need to wait for their output from the<br />
								pool, and then make a withdrawal of your funds
							</span>
						</Flex>
					</template>
				</Tooltip>

				<Flex align="center" gap="4">
					<Text size="14" color="tertiary" weight="600">
						0 of 0,
					</Text>

					<Text size="14" color="secondary" weight="600">0%</Text>

					<Icon name="arrow" size="14" color="tertiary" />
				</Flex>
			</Flex>

			<div :class="$style.bar">
				<div :class="$style.bar_progress" />
			</div>
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

			<Button type="secondary" size="medium" block keybind="G+C">
				<Icon name="credit_add" size="16" color="green" />
				Get available claims
			</Button>

			<Text
				size="12"
				color="support"
				weight="500"
				height="16"
				align="center"
				:class="$style.hint"
			>
				You can pick up the claims without waiting for the unconfirmed
				ones. Available claims will be formed in one batch request
			</Text>
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
	position: relative;

	height: 12px;
	border-radius: 3px;
	background: rgba(255, 255, 255, 0.05);

	overflow: hidden;
}

.bar_anim {
	position: absolute;

	top: 0;
	left: 0;

	animation: mig 38s infinite linear;
}

.bar_progress {
	width: 100%;
	height: 100%;
}

.bar_progress.blue {
	background: var(--blue);
}

@keyframes mig {
	0% {
		transform: translateX(0);
	}
	50% {
		transform: translateX(-300px);
	}
	100% {
		transform: translateX(0);
	}
}

.buttons {
	margin-top: 24px;
}

.hint {
	padding: 0 16px;
}

@media (max-width: 500px) {
	.funds {
		flex-direction: column;
		align-items: flex-start;
		gap: 16px;
	}
}
</style>
