<script setup>
/**
 * Vendor
 */
import { ref, watch, computed, nextTick, onMounted } from "vue"
import { Searcher } from "fast-fuzzy"

/**
 * Services
 */
import { currentNetwork } from "@sdk"
import { flags, updateFlag } from "@/services/flags"
import { parsePoolName } from "@utils/misc"
import { numberWithSymbol } from "@utils/amounts"

/**
 * Constants
 */
import { Networks } from "@/services/constants"

/**
 * UI
 */
import Modal from "@ui/Modal.vue"
import Input from "@ui/Input.vue"
import Block from "@ui/Block.vue"
import LoadingDots from "@ui/LoadingDots.vue"

/**
 * Store
 */
import { useAccountStore } from "@store/account"
import { useNotificationsStore } from "@store/notifications"

const accountStore = useAccountStore()
const notificationsStore = useNotificationsStore()

const props = defineProps({
	show: Boolean,
	pools: Array,
	poolsStates: Object,
	poolsAPY: Object,
})

const emit = defineEmits(["onClose", "onSelectPool"])

const searchEl = ref(null)
const searchText = ref("")
const poolsSearcher = ref({})

const sort = ref("tvl-desc")
const sortTarget = computed(() => sort.value.split("-")[0])
const sortDirection = computed(() => sort.value.split("-")[1])
const sortPools = (pools) => {
	const [target, direction] = sort.value.split("-")

	if (direction === "def") {
		return pools
	}

	if (target === "tvl") {
		return pools.sort((a, b) => {
			const aState = props.poolsStates[a.address]
			const bState = props.poolsStates[b.address]

			if (direction === "desc") return bState.totalLiquidity.toNumber() - aState.totalLiquidity.toNumber()
			if (direction === "asc") return aState.totalLiquidity.toNumber() - bState.totalLiquidity.toNumber()
		})
	}

	if (target === "apy") {
		return pools.sort((a, b) => {
			if (direction === "desc") return props.poolsAPY[b.address] - props.poolsAPY[a.address]
			if (direction === "asc") return props.poolsAPY[a.address] - props.poolsAPY[b.address]
		})
	}
}
const handleSort = (prop) => {
	const [target, direction] = sort.value.split("-")

	if (prop !== target) {
		sort.value = `${prop}-desc`
		return
	}

	if (direction === "desc") {
		sort.value = `${target}-asc`
	} else if (direction === "asc") {
		sort.value = `${target}-def`
	} else if (direction === "def") {
		sort.value = `${target}-desc`
	}
}

const activePools = computed(() => props.pools.filter((pool) => !pool.isDepositPaused))

const filteredPools = computed(() => {
	if (searchText.value) {
		let findedPools = poolsSearcher.value
			.search(searchText.value.toString(), {
				returnMatchData: true,
			})
			.map((el) => el.item)

		return sortPools(findedPools)
	} else {
		let allPools = [...props.pools]

		return sortPools(allPools)
	}
})

const handleSelectPool = (pool) => {
	if (!accountStore.pkh) {
		notificationsStore.create({
			notification: {
				type: "warning",
				title: "Connect wallet to deposit liquidity",
				description: "You can connect your wallet through the button in the upper right corner",
				autoDestroy: true,
			},
		})

		return
	}

	emit("onSelectPool", pool)
}

onMounted(() => {
	poolsSearcher.value = new Searcher(props.pools, {
		keySelector: (item) => {
			let { name } = item

			if (name.includes("XTZ")) {
				name += " Tezos"
			}
			if (name.includes("BTC")) {
				name += " Bitcoin"
			}
			if (name.includes("ETH")) {
				name += " Ethereun"
			}

			if (name.includes("1H")) {
				name += " 1 hour"
			}
			if (name.includes("6H")) {
				name += " 6 hours"
			}
			if (name.includes("1D")) {
				name += " 1 day"
			}

			return name.replace("Juster Pool: ", "").replaceAll("-", " ")
		},
		threshold: 0.62,
	})
})

const handlePoolsKeyboardNavigation = (e) => {
	if (e.key === "Enter") {
		const { tabIndex } = document.activeElement
		const pool = props.pools.find((pool, id) => id == tabIndex)
		if (pool) handleSelectPool(pool)
	}
}

watch(
	() => props.show,
	() => {
		if (props.show) {
			nextTick(() => {
				searchEl.value.$el.querySelector("input").focus()
			})
		} else {
			searchText.value = ""
		}
	},
)

const handleCloseTestnetWarning = () => {
	updateFlag("showTestnetWarningInStakeModal", false)

	notificationsStore.create({
		notification: {
			type: "success",
			title: "Testnet Warning is now hidden",
			autoDestroy: true,

			actions: [
				{
					name: "Undo",
					icon: "back",
					callback: () => {
						updateFlag("showTestnetWarningInStakeModal", true)
					},
				},
			],
		},
	})
}
</script>

<template>
	<Modal new :show="show" width="550" closable @onClose="emit('onClose')">
		<Flex align="center" justify="between" :class="$style.head">
			<Flex align="center" gap="8">
				<Icon name="server" size="16" color="secondary" />
				<Text size="14" weight="600" color="primary"> Deposit Liquidity </Text>
			</Flex>

			<Icon @click="emit('onClose')" name="close" size="16" color="tertiary" :class="$style.close_icon" />
		</Flex>

		<Flex @keydown="handlePoolsKeyboardNavigation" direction="column" gap="32" :class="$style.base">
			<Block v-if="flags.showTestnetWarningInStakeModal && currentNetwork === Networks.TESTNET" @onClose="handleCloseTestnetWarning">
				<span>This action is for the test network.</span> Use it to test tools or to understand how to interact with product.
			</Block>

			<Input ref="searchEl" v-model="searchText" type="text" icon="search" placeholder="Search a pool" cleanable />

			<Flex direction="column" gap="8">
				<Flex align="center" justify="between">
					<Text size="13" weight="600" color="primary"> Select a pool </Text>

					<Flex align="center" gap="16">
						<Flex @click="handleSort('tvl')" align="center" gap="4" :class="$style.sort_btn">
							<Icon
								v-if="sortTarget === 'tvl' && sortDirection !== 'def'"
								:name="(sortDirection === 'desc' && 'arrow_down') || (sortDirection === 'asc' && 'arrow_up')"
								size="12"
								color="blue"
							/>
							<Text size="12" weight="600" :color="sortDirection === 'def' || sortTarget !== 'tvl' ? 'tertiary' : 'primary'">
								TVL
							</Text>
						</Flex>
						<Flex @click="handleSort('apy')" align="center" gap="4">
							<Icon
								v-if="sortTarget === 'apy' && sortDirection !== 'def'"
								:name="(sortDirection === 'desc' && 'arrow_down') || (sortDirection === 'asc' && 'arrow_up')"
								size="12"
								color="blue"
							/>
							<Text size="12" weight="600" :color="sortDirection === 'def' || sortTarget !== 'apy' ? 'tertiary' : 'primary'">
								APY
							</Text>
						</Flex>
					</Flex>
				</Flex>

				<Flex direction="column" gap="8" :class="$style.pools">
					<Flex
						v-if="filteredPools.length"
						v-for="(pool, index) in filteredPools"
						:key="index"
						@click="handleSelectPool(pool)"
						align="center"
						justify="between"
						:tabindex="index"
						:class="$style.pool"
					>
						<Flex align="center" gap="20">
							<Flex direction="column" gap="8">
								<Text size="14" weight="600" color="primary">
									{{ parsePoolName(pool.name.replace("Juster Pool: ", "")) }}
								</Text>

								<Flex align="center" gap="8">
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
							</Flex>
						</Flex>

						<Flex align="center" gap="24">
							<Flex direction="column" gap="8" align="end">
								<Flex align="center" gap="6">
									<Icon name="coins" size="12" color="tertiary" />

									<Text v-if="poolsStates[pool.address]" size="14" weight="600" color="primary">
										{{ numberWithSymbol(poolsStates[pool.address].totalLiquidity, ",") }}
									</Text>
									<LoadingDots v-else />
								</Flex>

								<Text size="12" weight="600" color="tertiary"> Total Value Locked </Text>
							</Flex>

							<Flex direction="column" gap="8" align="end">
								<Flex align="center" gap="6">
									<Icon
										name="stars"
										size="14"
										:color="
											(poolsAPY[pool.address] * 100 < -15 && 'red') ||
											(poolsAPY[pool.address] * 100 < 2 && 'tertiary') ||
											(poolsAPY[pool.address] * 100 < 6 && 'yellow') ||
											(poolsAPY[pool.address] * 100 < 100 && 'green') ||
											'tertiary'
										"
									/>
									<Text size="14" weight="600" color="primary">
										{{ numberWithSymbol(poolsAPY[pool.address] * 100, ",") }}%
									</Text>
								</Flex>

								<Text size="12" weight="600" color="tertiary"> APY </Text>
							</Flex>
						</Flex>
					</Flex>
					<Flex v-else direction="column" gap="8" align="center" :class="$style.nothing_found_warning">
						<Text size="13" weight="600" color="secondary"> Nothing found </Text>
						<Text size="12" weight="500" height="16" align="center" color="tertiary">
							Tip: You can use the full name e.g. "<b>Bitcoin</b>", "<b>1 day</b>", "<b>Tezos 6 hours</b>" etc
						</Text>
					</Flex>
				</Flex>

				<Text size="12" weight="600" color="tertiary">
					{{ searchText.length ? filteredPools.length : activePools.length }}
					{{ searchText.length ? "found" : "active" }} pools
				</Text>
			</Flex>

			<!-- <Flex direction="column" gap="12" align="center">
				<Button
					@click="emit('onContinue')"
					@onKeybind="emit('onContinue')"
					type="secondary"
					size="large"
					block
					keybind="C"
				>
					<Icon name="login" size="16" color="white" />
					Continue
				</Button>

				<Text
					size="12"
					weight="500"
					color="support"
					align="center"
					height="16"
					style="max-width: 400px"
				>
					You can select multiple pools to add liquidity to multiple
					destinations at once with a single request
				</Text>
			</Flex> -->
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
	padding: 8px 20px 20px 20px;
	margin-bottom: 16px;
}

.pools {
	max-height: 260px;
	min-height: 260px;
	padding: 2px;
	overflow-y: auto;
}

.pool {
	min-height: 66px;

	background: rgba(255, 255, 255, 0.05);
	border-radius: 8px;
	cursor: pointer;
	box-shadow: 0 0 0 0 transparent;

	padding: 0 16px;

	transition: all 0.2s ease;
}

.pool:focus {
	box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
	outline: none;
}

.pool:hover {
	box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
}

.nothing_found_warning {
	margin: auto 0;
}

.nothing_found_warning div:nth-child(2) {
	max-width: 250px;
}

.sort_btn {
	cursor: pointer;
}
</style>
