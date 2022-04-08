<script setup>
import { computed, onBeforeUnmount, onMounted, reactive } from "vue"
import { useRouter } from "vue-router"
import axios from "axios"
import { DateTime } from "luxon"

/**
 * Services
 */
import { juster, switchNetwork, currentNetwork } from "@/services/sdk"
import { capitalizeFirstLetter } from "@/services/utils/global"

/**
 * Constants
 */
import { Networks } from "@/services/constants"

/**
 * Store
 */
import { useMarketStore } from "@/store/market"
const marketStore = useMarketStore()

/**
 * UI
 */
import Button from "@/components/ui/Button"
import Tooltip from "@/components/ui/Tooltip"
import { Dropdown, DropdownItem, DropdownTitle } from "@/components/ui/Dropdown"

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
	if (
		status.dipdup === STATUSES.GOOD &&
		status.network === STATUSES.GOOD &&
		status.quotes == STATUSES.GOOD
	) {
		return { text: "All systems online", color: "green" }
	} else if (
		status.dipdup === STATUSES.DELAYED &&
		status.network === STATUSES.DELAYED &&
		status.quotes == STATUSES.DELAYED
	) {
		return { text: "All systems delayed", color: "red" }
	} else if (
		status.dipdup !== STATUSES.GOOD ||
		status.network !== STATUSES.GOOD ||
		status.quotes !== STATUSES.GOOD
	) {
		return { text: "Some systems delayed", color: "yellow" }
	}
})

const checkDipdup = async () => {
	const urlToCheck =
		currentNetwork.value == "mainnet"
			? "https://juster.dipdup.net/api/rest/dipdupHead?name=https://api.tzkt.io"
			: "https://api.ithacanet.juster.fi/api/rest/dipdupHead?name=https://api.ithacanet.tzkt.io"
	const {
		data: { dipdupHeadByPk },
	} = await axios.get(urlToCheck)

	const dipdupDt = DateTime.fromISO(dipdupHeadByPk.timestamp)
	const dipdupDiff = initCurrentDt
		.diff(dipdupDt, ["minutes", "seconds"])
		.toObject()

	if (dipdupDiff.minutes >= 1) {
		status.dipdup = STATUSES.DELAYED
	} else {
		status.dipdup = STATUSES.GOOD
	}
}

const checkNetwork = async () => {
	const { data } = await axios.get(
		`https://rpc.tzkt.io/${
			currentNetwork.value == "mainnet" ? "mainnet" : "ithacanet"
		}/chains/main/blocks/head/header`,
	)

	const networkDt = DateTime.fromISO(data.timestamp)
	const networkDiff = initCurrentDt
		.diff(networkDt, ["minutes", "seconds"])
		.toObject()

	if (networkDiff.minutes >= 1) {
		status.network = STATUSES.DELAYED
	} else {
		status.network = STATUSES.GOOD
	}
}

const checkQuotes = () => {
	const quotesDiff = initCurrentDt
		.diff(
			DateTime.fromISO(
				marketStore.markets["XTZ-USD"].quotes[0].timestamp,
			),
			["minutes"],
		)
		.toObject()

	if (quotesDiff.minutes >= 3) {
		status.quotes = STATUSES.DELAYED
	} else {
		status.quotes = STATUSES.GOOD
	}
}

const handleSwitch = (network) => {
	juster.sdk._provider.client.clearActiveAccount().then(async () => {
		switchNetwork(network)
	})
}

marketStore.$subscribe((mutation, state) => {
	if (state.markets["XTZ-USD"].quotes.length) {
		checkQuotes()
	}
})

onMounted(async () => {
	checkDipdup()
	checkNetwork()

	checkInterval = setInterval(async () => {
		checkDipdup()
		checkNetwork()
		checkQuotes()
	}, 30000)
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

						<router-link to="/" :class="$style.link"
							>Explore</router-link
						>
						<router-link to="/events" :class="$style.link"
							>Events</router-link
						>
						<router-link to="/markets" :class="$style.link"
							>Markets</router-link
						>
					</div>

					<div :class="$style.column">
						<div :class="$style.name">Learn</div>
						<router-link to="/docs" :class="$style.link"
							>Documentation</router-link
						>
						<router-link to="/docs/developers" :class="$style.link"
							>Developers</router-link
						>
						<router-link to="/docs/faq" :class="$style.link"
							>FAQ</router-link
						>
					</div>

					<div :class="$style.column">
						<div :class="$style.name">Misc</div>
						<router-link to="/policy" :class="$style.link"
							>Privacy Policy</router-link
						>
						<router-link to="/terms" :class="$style.link"
							>Terms of Use</router-link
						>
						<router-link to="/sitemap" :class="$style.link"
							>Sitemap</router-link
						>
					</div>
				</div>
			</div>

			<div :class="$style.bottom">
				<div :class="$style.block">
					<div :class="$style.left">
						<Tooltip position="top">
							<a href="https://status.juster.fi" target="_blank">
								<Button
									type="secondary"
									size="small"
									:class="[
										$style.footer_btn,
										$style[statusBlock.color],
									]"
								>
									<Icon name="bolt" size="12" />{{
										statusBlock.text
									}}
								</Button>
							</a>

							<template #content
								><span>DipDup:</span> {{ status.dipdup
								}}<br /><span>Network:</span> {{ status.network
								}}<br /><span>Quotes:</span>
								{{ status.quotes }}</template
							>
						</Tooltip>

						<Dropdown side="top">
							<template #trigger>
								<Button
									type="secondary"
									size="small"
									:class="[
										$style.footer_btn,
										currentNetwork == 'mainnet'
											? $style.green
											: $style.yellow,
									]"
								>
									<Icon name="network" size="12" />{{
										capitalizeFirstLetter(currentNetwork)
									}}
									<Icon name="arrow" size="12" />
								</Button>
							</template>

							<template #dropdown>
								<DropdownTitle>Network</DropdownTitle>
								<DropdownItem @click="handleSwitch('mainnet')"
									><Icon
										:name="
											currentNetwork == 'mainnet'
												? 'checkcircle'
												: 'network'
										"
										size="12"
									/>Mainnet</DropdownItem
								>
								<DropdownItem @click="handleSwitch('testnet')"
									><Icon
										:name="
											currentNetwork == 'ithacanet'
												? 'checkcircle'
												: 'network'
										"
										size="12"
									/>Ithacanet</DropdownItem
								>
							</template>
						</Dropdown>
					</div>

					<div :class="$style.right">
						<a
							href="https://discord.gg/FeGDCkHhnB"
							target="_blank"
							rel="nofolow noreferrer"
						>
							<Button
								type="secondary"
								size="small"
								:class="$style.footer_btn"
							>
								Discord <Icon name="arrowrighttop" size="16" />
							</Button>
						</a>
						<a
							href="https://twitter.com/Juster_fi"
							target="_blank"
							rel="nofolow noreferrer"
						>
							<Button
								type="secondary"
								size="small"
								:class="$style.footer_btn"
							>
								Twitter <Icon name="arrowrighttop" size="16" />
							</Button>
						</a>
						<a
							href="https://github.com/juster-finance"
							target="_blank"
							rel="nofolow noreferrer"
						>
							<Button
								type="secondary"
								size="small"
								:class="$style.footer_btn"
							>
								GitHub <Icon name="arrowrighttop" size="16" />
							</Button>
						</a>
					</div>
				</div>

				<div :class="$style.block">
					<div :class="$style.copyrights">
						<div :class="$style.year">© 2022</div>
						<span>Juster 1.0.</span> Market data provided by
						Coinbase Harbinger
					</div>

					<div :class="$style.warning">
						Participation in gambling is prohibited for persons
						under the age of 21+
					</div>
				</div>
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

	fill: var(--text-primary);
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

.footer_btn.green svg:first-child {
	fill: var(--green);
}

.footer_btn.yellow svg:first-child {
	fill: var(--yellow);
}

.footer_btn.red svg:first-child {
	fill: var(--red);
}

.copyrights {
	display: flex;
	align-items: center;
	gap: 6px;

	font-size: 14px;
	font-weight: 600;
	color: var(--text-tertiary);
	white-space: nowrap;
}

.copyrights span {
	color: var(--text-secondary);
}

.year {
	font-weight: 500;
}

.warning {
	font-size: 12px;
	line-height: 1;
	font-weight: 500;
	color: var(--text-tertiary);
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
}

@media (max-width: 700px) {
	.columns {
		gap: 50px;
		flex-direction: column;
	}

	.column {
		align-items: center;
	}

	.copyrights {
		flex-wrap: wrap;
		justify-content: center;
	}

	.warning {
		text-align: center;
		line-height: 1.6;
	}
}
</style>
