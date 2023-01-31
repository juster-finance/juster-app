<script setup>
/**
 * Vendor
 */
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue"
import { useRouter } from "vue-router"
import { DateTime } from "luxon"

/**
 * UI
 */
import Button from "@ui/Button.vue"
import Tooltip from "@ui/Tooltip.vue"
import LoadingDots from "@ui/LoadingDots.vue"
import {
	Dropdown,
	DropdownItem,
	DropdownTitle,
	DropdownDivider,
} from "@ui/Dropdown"

/**
 * Services
 */
import { juster } from "@sdk"
import {
	toClipboard,
	getCurrencyIcon,
	shorten,
	parsePoolName,
} from "@utils/misc"
import { numberWithSymbol } from "@utils/amounts"

/**
 * Store
 */
import { useAccountStore } from "@store/account"
import { useNotificationsStore } from "@store/notifications"

const accountStore = useAccountStore()
const notificationsStore = useNotificationsStore()

const router = useRouter()

const emit = defineEmits(["onSelectPool", "onRequestWithdraw", "onShare"])
const props = defineProps({
	pool: {
		type: Object,
		required: true,
	},
	state: {
		type: Object,
	},
	apy: {
		type: Number,
	},
	position: {
		type: Object,
	},
})

const riskIndex = ref(0)
const utilization = ref(0)

let poolUpdInterval = null
const poolUpdDiff = ref({})
const updateTimeDiff = () => {
	let dt = DateTime.fromJSDate(props.state.timestamp)

	if (dt.invalid) {
		dt = DateTime.fromISO(props.state.timestamp)
	}

	poolUpdDiff.value = dt.setLocale("en").toRelative()
}
watch(
	() => props.state,
	() => {
		if (props.state) updateTimeDiff()
	},
)

onMounted(() => {
	poolUpdInterval = setInterval(() => {
		updateTimeDiff()
	}, 30_000)

	juster.pools[props.pool.address].subscribeToRiskIndex((data) => {
		riskIndex.value = data.toNumber() * 100
	})
	juster.pools[props.pool.address].subscribeToUtilization((data) => {
		utilization.value = data.toNumber() * 100
	})
})

onBeforeUnmount(() => {
	clearInterval(poolUpdInterval)

	juster.pools[props.pool.address].unsubscribeFromRiskIndex()
	juster.pools[props.pool.address].unsubscribeFromUtilization()
})

const handleDeposit = () => {
	if (!parseFloat(accountStore.balance)) return
	if (!isDepositAvailable.value) {
		if (!accountStore.pkh)
			notificationsStore.create({
				notification: {
					type: "warning",
					title: "Connect wallet to deposit liquidity",
					description:
						"You can connect your wallet through the button in the upper right corner",
					autoDestroy: true,
				},
			})
		if (props.pool.isDepositPaused)
			notificationsStore.create({
				notification: {
					type: "warning",
					title: `"${props.pool.name.replace(
						"Juster Pool: ",
						"",
					)} pool" is paused`,
					description: "It may be restored soon, try again later. ",
					autoDestroy: true,
				},
			})

		return
	}

	emit("onSelectPool", props.pool)
}

const isDepositAvailable = computed(() => {
	if (!props.state) return false
	if (!accountStore.pkh) return false
	if (props.pool.isDepositPaused) return false

	return true
})

const showUserData = ref(false)
const handleSwitch = () => {
	showUserData.value = !showUserData.value
}

const copy = (target) => {
	if (target == "address") {
		notificationsStore.create({
			notification: {
				icon: "copy",
				title: "Pool address copied to clipboard",
				autoDestroy: true,
				badges: [
					{
						secondaryText: shorten(props.pool.address),
						icon: "pool",
					},
				],
			},
		})

		toClipboard(props.pool.address)
	}
	if (target == "url") {
		notificationsStore.create({
			notification: {
				icon: "copy",
				title: "Pool explorer link copied to clipboard",
				autoDestroy: true,
				badges: [
					{
						secondaryText: `ghostnet.tzkt.io/${shorten(
							props.pool.address,
						)}`,
						icon: "explorer",
					},
				],

				actions: [
					{
						name: "Open in new tab",
						callback: () =>
							window.open(
								`https://ghostnet.tzkt.io/${props.pool.address}`,
								"_blank",
							),
					},
				],
			},
		})

		toClipboard(`https://ghostnet.tzkt.io/${props.pool.address}`)
	}
}
</script>

<template>
	<Flex
		@click="router.push(`/pools/${pool.address}`)"
		direction="column"
		gap="32"
		tabindex="0"
		:class="$style.wrapper"
	>
		<Flex justify="between">
			<Flex align="center" gap="16">
				<div :class="$style.symbols">
					<img :src="getCurrencyIcon('XTZ')" alt="symbol" />
					<img :src="getCurrencyIcon('USD')" alt="symbol" />
				</div>

				<Flex direction="column" gap="8">
					<Text size="14" color="primary" weight="600">
						{{
							parsePoolName(
								pool?.name.replace("Juster Pool: ", ""),
							)
						}}
					</Text>

					<Flex align="center" gap="4">
						<Icon
							:name="
								!pool.isDepositPaused ? 'zap_circle' : 'pause'
							"
							size="12"
							:color="!pool.isDepositPaused ? 'green' : 'yellow'"
						/>
						<Text
							size="12"
							weight="600"
							:color="!pool.isDepositPaused ? 'green' : 'yellow'"
						>
							{{ !pool.isDepositPaused ? "Active" : "Paused" }}
						</Text>
					</Flex>
				</Flex>
			</Flex>

			<Flex gap="8">
				<Tooltip
					placement="bottom-end"
					:disabled="!!isDepositAvailable"
				>
					<Button
						@click.prevent="handleDeposit"
						:disabled="
							!isDepositAvailable ||
							!parseFloat(accountStore.balance)
						"
						type="secondary"
						size="small"
					>
						<Icon name="plus_circle" size="16" color="blue" />
						Deposit
					</Button>

					<template #content>
						{{
							(pool.isDepositPaused &&
								"The pool has been paused") ||
							(!accountStore.pkh &&
								"Connect a wallet to make a deposit")
						}}
					</template>
				</Tooltip>
			</Flex>
		</Flex>

		<Flex align="center" justify="between" gap="16" :class="$style.bottom">
			<Flex align="center" gap="24" :class="$style.stats">
				<!-- TVL -->
				<Flex direction="column" gap="8" :class="$style.stat">
					<Text
						size="13"
						weight="600"
						color="tertiary"
						:class="$style.stat__title"
					>
						TVL
					</Text>

					<Flex align="center" gap="6">
						<Icon name="coins" size="14" color="secondary" />

						<Text
							v-if="state"
							size="15"
							weight="600"
							color="secondary"
						>
							{{
								showUserData
									? numberWithSymbol(
											position.depositedAmount,
											",",
									  )
									: numberWithSymbol(
											state.totalLiquidity,
											",",
									  )
							}}
						</Text>
						<LoadingDots v-else />
					</Flex>
				</Flex>

				<Text
					size="12"
					weight="500"
					color="tertiary"
					:class="$style.star_icon"
				>
					✦
				</Text>

				<!-- Share Price -->
				<Flex direction="column" gap="8" :class="$style.stat">
					<Text
						size="13"
						weight="600"
						color="tertiary"
						:class="$style.stat__title"
					>
						{{ showUserData ? "Entry Price" : "Share Price" }}
					</Text>

					<Flex align="center" gap="6">
						<Icon name="banknote" size="14" color="secondary" />

						<Text
							v-if="state"
							size="15"
							weight="600"
							color="secondary"
						>
							{{
								showUserData
									? position.entrySharePrice.toFixed(2)
									: state.sharePrice.toFixed(2)
							}}
						</Text>
						<LoadingDots v-else />
					</Flex>
				</Flex>

				<Text
					size="12"
					weight="500"
					color="tertiary"
					:class="$style.star_icon"
					>✦</Text
				>

				<!-- APY -->
				<Flex direction="column" gap="8" :class="$style.stat">
					<Text
						size="13"
						weight="600"
						color="tertiary"
						:class="$style.stat__title"
					>
						{{ showUserData ? "My Shares" : "APY" }}
					</Text>

					<Flex align="center" gap="6">
						<Icon
							v-if="!showUserData"
							name="stars"
							size="14"
							:color="
								(apy * 100 < 0 && 'red') ||
								(apy * 100 < 40 && 'tertiary') ||
								(apy * 100 < 80 && 'yellow') ||
								(apy * 100 >= 100 && 'green') ||
								'tertiary'
							"
						/>
						<Icon v-else name="money" size="14" color="secondary" />
						<Text size="15" weight="600" color="secondary">
							{{
								showUserData
									? position.shares.toFixed(2)
									: apy
									? `${numberWithSymbol(apy * 100, ",")}%`
									: `0%`
							}}
						</Text>
					</Flex>
				</Flex>

				<!-- Switch Button -->

				<Flex
					v-if="accountStore.pkh && position"
					@click.prevent="handleSwitch"
					align="center"
					gap="8"
					:class="$style.switch_btn"
				>
					<Icon
						name="arrows"
						size="16"
						color="secondary"
						:class="$style.arrows_icon"
						:style="{
							transform: `rotate(${
								showUserData ? '270' : '90'
							}deg)`,
						}"
					/>
					<Text
						size="12"
						weight="700"
						color="secondary"
						:class="$style.switch_btn__text"
					>
						{{
							showUserData
								? "Switch to pool statistics"
								: "Switch to my statistics"
						}}
					</Text>

					<img
						v-if="!showUserData"
						:src="`https://services.tzkt.io/v1/avatars/${accountStore.pkh}`"
						alt="avatar"
					/>
					<Icon v-else name="server" size="16" color="secondary" />
				</Flex>
			</Flex>

			<Flex align="center" gap="24" :class="$style.stats">
				<Flex direction="column" gap="8" :class="$style.stat">
					<Text
						size="13"
						weight="600"
						color="tertiary"
						:class="$style.stat__title"
					>
						Utilization
					</Text>

					<Flex align="center" gap="6">
						<Icon
							:name="
								(utilization < 0.01 && 'warning') ||
								'checkcircle'
							"
							size="14"
							:color="
								(utilization <= 0.01 && 'red') ||
								(utilization > 0.01 &&
									utilization < 0.1 &&
									'tertiary') ||
								(utilization >= 0.1 && 'green')
							"
						/>
						<Text size="15" weight="600" color="secondary">
							{{ utilization.toFixed(2) }}%
						</Text>
					</Flex>
				</Flex>

				<Text
					size="12"
					weight="500"
					color="tertiary"
					:class="$style.star_icon"
					>✦</Text
				>

				<Flex direction="column" gap="8" :class="$style.stat">
					<Text
						size="13"
						weight="600"
						color="tertiary"
						:class="$style.stat__title"
					>
						Risk Index
					</Text>

					<Flex align="center" gap="6">
						<Icon
							:name="
								(riskIndex > 1 && 'warning') || 'checkcircle'
							"
							size="14"
							:color="(riskIndex > 1 && 'red') || 'tertiary'"
						/>
						<Text size="15" weight="600" color="secondary">
							{{ riskIndex.toFixed(2) }}%
						</Text>
					</Flex>
				</Flex>
			</Flex>
		</Flex>

		<Flex justify="between">
			<Flex direction="column" gap="8">
				<Flex align="center" gap="6">
					<Icon name="server" size="12" color="tertiary" />
					<Text size="13" weight="600" color="tertiary">
						Liquidity Pool
					</Text>
				</Flex>

				<Text v-if="state" size="12" color="support" weight="600">
					State updated {{ poolUpdDiff }}
				</Text>
			</Flex>

			<Dropdown disable-autofocus>
				<template #trigger>
					<Button @click.prevent type="secondary" size="small">
						<Icon name="dots" size="12" />
					</Button>
				</template>

				<template #dropdown>
					<DropdownItem
						@click="emit('onRequestWithdraw', pool)"
						:disabled="!position"
					>
						<Icon name="money" size="16" /> Withdraw
					</DropdownItem>

					<DropdownDivider />

					<DropdownItem>
						<Icon name="time" size="16" />Pool timeline
					</DropdownItem>

					<DropdownDivider />

					<DropdownTitle>Copy</DropdownTitle>
					<DropdownItem @click="copy('address')">
						<Icon name="copy" size="16" /> Pool address
					</DropdownItem>
					<DropdownItem @click="copy('url')">
						<Icon name="copy" size="16" /> Pool explorer link
					</DropdownItem>

					<DropdownDivider />

					<DropdownItem @click="emit('onShare', pool)">
						<Icon name="share" size="16" />Share
					</DropdownItem>
				</template>
			</Dropdown>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	border-radius: 8px;
	background: var(--card-bg);
	box-shadow: 0 0 0 0 transparent;
	cursor: pointer;

	padding: 24px;

	transition: box-shadow 0.2s ease;
}

.wrapper:hover {
	box-shadow: 0 0 0 2px var(--border);
}

.wrapper:focus {
	box-shadow: 0 0 0 2px var(--border);
	outline: none;
}

.symbols {
	position: relative;

	width: 30px;
	height: 30px;
}

.symbols img {
	width: 20px;
	height: 20px;
	border-radius: 5px;
}

.symbols img:first-child {
	position: absolute;
	z-index: 1;
	outline: 3px solid var(--card-bg);
}

.symbols img:last-child {
	position: absolute;
	top: 10px;
	right: 0;
}

.stats {
	background: rgba(0, 0, 0, 0.15);
	border-radius: 8px;

	padding: 12px 14px;
}

.switch_btn {
	height: 32px;
	border-radius: 8px;
	background: rgba(255, 255, 255, 0.05);
	cursor: pointer;

	padding: 0 8px;

	transition: all 0.2s ease;
}

.switch_btn:hover {
	background: var(--opacity-10);
}

.switch_btn:active {
	transform: translateY(1px);
}

.arrows_icon {
	transition: all 0.2s ease;
}

.switch_btn img {
	width: 20px;
	height: 20px;

	border-radius: 50%;
}

.stat__title {
	white-space: nowrap;
}

.switch_btn__text {
	display: none;
}

@media (max-width: 1200px) {
	.bottom {
		flex-direction: column;
	}

	.stats {
		width: 100%;
	}
}

@media (max-width: 500px) {
	.wrapper {
		padding: 16px;
	}

	.stats {
		flex-direction: column;
		gap: 16px;
	}

	.stat {
		width: 100%;

		flex-direction: row;
		justify-content: space-between;
	}

	.star_icon {
		display: none;
	}

	.switch_btn__text {
		display: flex;
	}
}
</style>
