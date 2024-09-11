<script setup>
/**
 * Vendor
 */
import { computed, onBeforeUnmount, onMounted, reactive } from "vue"
import { useRouter } from "vue-router"
import axios from "axios"
import { DateTime } from "luxon"

/**
 * Services
 */
import { juster, switchNetwork, currentNetwork } from "@sdk"
import { capitalizeFirstLetter } from "@utils/misc"

/**
 * UI
 */
import Button from "@ui/Button.vue"
import Tooltip from "@ui/Tooltip.vue"
import { Dropdown, DropdownItem, DropdownTitle } from "@ui/Dropdown"

/**
 * Store
 */
import { useMarketStore } from "@store/market"

const marketStore = useMarketStore()

const router = useRouter()

/** Watch for DipDup, Quotes, Network */
let checkInterval = null

const initCurrentDt = DateTime.now()

const STATUSES = {
	LOADING: "Loading..",
	GOOD: "Good",
	DELAYED: "Delayed",
}

const status = reactive({
	dipdup: STATUSES.LOADING,
	network: STATUSES.LOADING,
	quotes: STATUSES.LOADING,
})

const statusBlock = computed(() => {
	if (status.dipdup === STATUSES.GOOD && status.network === STATUSES.GOOD && status.quotes == STATUSES.GOOD) {
		return { text: "Stable", color: "green" }
	} else if (status.dipdup === STATUSES.DELAYED && status.network === STATUSES.DELAYED && status.quotes == STATUSES.DELAYED) {
		return { text: "Everything delayed", color: "red" }
	} else {
		return { text: "Systems delayed", color: "yellow" }
	}
})

const checkDipdup = async () => {
	const urlToCheck =
		currentNetwork.value == "mainnet"
			? "https://juster.dipdup.net/api/rest/dipdupHead?name=https://tzkt-mainnet.dipdup.net"
			: "https://api.ithacanet-pool.juster.fi/api/rest/dipdupHead?name=https://api.ghostnet.tzkt.io"
	const {
		data: { dipdupHeadByPk },
	} = await axios.get(urlToCheck)

	const dipdupDt = DateTime.fromISO(dipdupHeadByPk.timestamp)
	const dipdupDiff = initCurrentDt.diff(dipdupDt, ["minutes", "seconds"]).toObject()

	if (dipdupDiff.minutes >= 3) {
		status.dipdup = STATUSES.DELAYED
	} else {
		status.dipdup = STATUSES.GOOD
	}
}

const checkNetwork = async () => {
	const { data } = await axios.get(
		`https://rpc.tzkt.io/${currentNetwork.value == "mainnet" ? "mainnet" : "ghostnet"}/chains/main/blocks/head/header`,
	)

	const networkDt = DateTime.fromISO(data.timestamp)
	const networkDiff = initCurrentDt.diff(networkDt, ["minutes", "seconds"]).toObject()

	if (networkDiff.minutes >= 1) {
		status.network = STATUSES.DELAYED
	} else {
		status.network = STATUSES.GOOD
	}
}

const checkQuotes = () => {
	const quotesDiff = initCurrentDt.diff(DateTime.fromISO(marketStore.markets["TON-USD"].quotes[0].timestamp), ["minutes"]).toObject()

	if (quotesDiff.minutes >= 10) {
		status.quotes = STATUSES.DELAYED
	} else {
		status.quotes = STATUSES.GOOD
	}
}

const handleSwitch = (network) => {
	// TODO: #1
	// juster.sdk._provider.client.clearActiveAccount().then(async () => {
	// 	switchNetwork(network, router)
	// })
}

marketStore.$subscribe((mutation, state) => {
	if (state.markets["TON-USD"].quotes.length) {
		checkQuotes()
	}
})

onMounted(async () => {
	// checkDipdup()
	// checkNetwork()

	// checkInterval = setInterval(async () => {
	// 	checkDipdup()
	// 	checkNetwork()
	// 	checkQuotes()
	// }, 30000)
})

onBeforeUnmount(() => {
	clearInterval(checkInterval)
})
</script>

<template>
	<div :class="$style.wrapper">
		<div :class="$style.base">
			<div :class="$style.content">
				<div :class="$style.logo">
					<Icon name="logo_symbol" size="32" />
				</div>

				<div :class="$style.columns">
					<div :class="$style.column">
						<div :class="$style.name">Juster</div>

						<router-link to="/" :class="$style.link">Explore</router-link>
						<router-link to="/events" :class="$style.link">Events</router-link>
						<router-link to="/markets" :class="$style.link">Markets</router-link>
						<router-link to="/pools" :class="$style.link"> Liquidity Pools </router-link>
					</div>

					<div :class="$style.column">
						<div :class="$style.name">Learn</div>
						<router-link to="/docs" :class="$style.link">Documentation</router-link>
						<router-link to="/docs/roadmap" :class="$style.link">Roadmap</router-link>
						<router-link to="/docs/faq" :class="$style.link">FAQ</router-link>
					</div>

					<div :class="$style.column">
						<div :class="$style.name">Misc</div>
						<router-link to="/policy" :class="$style.link">Privacy Policy</router-link>
						<router-link to="/terms" :class="$style.link">Terms of Use</router-link>
						<router-link to="/sitemap" :class="$style.link">Sitemap</router-link>
					</div>
				</div>
			</div>

			<div :class="$style.bottom">
				<div :class="$style.block">
					<div :class="$style.left">
						<!-- <Tooltip placement="top">
							<Button
								type="secondary"
								size="small"
								link="https://status.juster.fi"
								:class="[$style.footer_btn, $style[statusBlock.color]]"
							>
								<Icon :name="(statusBlock.color === 'green' && 'checkcircle') || 'warning'" size="14" :class="$style" />
								{{ statusBlock.text }}
							</Button>

							<template #content>
								<span>DipDup:</span> {{ status.dipdup }}<br /><span>Network:</span> {{ status.network }}<br /><span
									>Quotes:</span
								>
								{{ status.quotes }}
							</template>
						</Tooltip> -->

						<!-- <Dropdown side="top">
							<template #trigger>
								<Button type="secondary" size="small" :class="[$style.footer_btn]" data-cy="network-dropdown">
									<Icon :name="currentNetwork === 'testnet' ? 'hammer' : 'explorer'" size="12" />
									{{ currentNetwork === "mainnet" ? "Main Network" : "Test Network" }}
									<Icon name="arrow" size="12" />
								</Button>
							</template>

							<template #dropdown>
								<DropdownTitle>Network</DropdownTitle>
								<DropdownItem @click="handleSwitch('mainnet')" :data-active="currentNetwork === 'mainnet' && true"
									><Icon :name="currentNetwork === 'mainnet' ? 'check' : 'dot'" size="16" />
									Main Network
								</DropdownItem>
								<DropdownItem @click="handleSwitch('testnet')" :data-active="currentNetwork === 'testnet' && true">
									<Icon :name="currentNetwork === 'testnet' ? 'check' : 'dot'" size="16" />
									Test Network
								</DropdownItem>
							</template>
						</Dropdown> -->
					</div>

					<div :class="$style.right">
						<Button type="secondary" size="small" link="https://discord.gg/FeGDCkHhnB" :class="$style.footer_btn">
							Discord
							<Icon name="arrowrighttop" size="16" color="tertiary" />
						</Button>
						<Button type="secondary" size="small" link="https://twitter.com/Juster_fi" :class="$style.footer_btn">
							Twitter
							<Icon name="arrowrighttop" size="16" color="tertiary" />
						</Button>
						<Button type="secondary" size="small" link="https://github.com/juster-finance" :class="$style.footer_btn">
							GitHub
							<Icon name="arrowrighttop" size="16" color="tertiary" />
						</Button>
					</div>
				</div>

				<Flex justify="between" :class="$style.copyrights">
					<Flex align="center" wrap="wrap" :class="$style.line">
						<Text size="14" weight="500" color="tertiary"> © {{ DateTime.now().year }}&nbsp;&nbsp; </Text>
						<Text size="11" color="support">✦</Text>
						<Text size="14" weight="500" color="secondary"> &nbsp;&nbsp;Juster 1.1&nbsp; </Text>
						<Text size="14" weight="500" color="tertiary"> Market data provided by&nbsp; </Text>
						<a href="https://tzkt.io/KT1AdbYiPYb5hDuEuVrfxmFehtnBCXv4Np7r/operations/" target="_blank">
							<Text size="14" weight="500" color="secondary"> Harbinger Oracle </Text>
						</a>
					</Flex>

					<Flex direction="column" gap="8" align="end" :class="$style.line">
						<Text size="12" weight="500" color="support">
							Participation in gambling is prohibited for persons under the age of 21+
						</Text>
						<Text size="12" weight="500" color="support"> Check your country's restrictions before using the application </Text>
					</Flex>
				</Flex>
			</div>
		</div>
	</div>
</template>

<style module>
.wrapper {
	width: 100%;

	display: flex;
	justify-content: center;

	border-top: 1px solid var(--border);
}

.base {
	width: 100%;
	max-width: 1250px;
	margin: 0 32px;
	padding: 50px 0;
}

.content {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	gap: 60px;
}

.logo {
	display: flex;
	align-items: center;
	gap: 12px;

	fill: var(--text-support);
}

.columns {
	display: flex;
	flex-wrap: wrap;
	gap: 150px;
}

.column {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.name {
	font-size: 14px;
	font-weight: 600;
	color: var(--text-primary);
}

.link {
	font-size: 14px;
	font-weight: 500;
	color: var(--text-tertiary);

	transition: color 0.2s ease;
}

.link:hover {
	color: var(--text-primary);
}

.link:focus {
	box-shadow: 0 0 0 transparent;
	color: var(--text-primary);
}

.bottom {
	display: flex;
	flex-direction: column;
	gap: 24px;

	margin-top: 50px;
}

.block {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.left,
.right {
	display: flex;
	align-items: center;
	gap: 8px;
}

.footer_btn {
	color: var(--text-secondary);
}

.footer_btn.green svg {
	fill: var(--green);
}

.footer_btn.yellow svg {
	fill: var(--yellow);
}

.footer_btn.red svg {
	fill: var(--red);
}

@media (max-width: 900px) {
	.content {
		flex-direction: column;
		align-items: center;
	}

	.block {
		flex-direction: column;
		gap: 24px;
	}

	.copyrights {
		flex-wrap: wrap;
		justify-content: center;

		gap: 24px;
	}

	.line {
		align-items: center;
		justify-content: center;
	}

	.line * {
		text-align: center;
		line-height: 1.6;
	}
}

@media (max-width: 700px) {
	.columns {
		gap: 50px;
		flex-direction: column;
	}

	.column {
		align-items: center;
	}
}
</style>
