<script setup>
/**
 * Vendor
 */
import { ref, onMounted } from "vue"
import { useMeta } from "vue-meta"
import { NetworkType } from "@airgap/beacon-dapp"
import { useRouter } from "vue-router"

/**
 * UI
 */
import Button from "@/components/ui/Button"
import Tooltip from "@/components/ui/Tooltip"

/**
 * Modals
 */
import CustomLoginModal from "@/components/local/modals/CustomLoginModal"

/**
 * Services
 */
import { juster, analytics, currentNetwork } from "@/services/sdk"

/**
 * Composable
 */
import { useMarket } from "@/composable/market"

/**
 * API
 */
import { fetchAllUsers } from "@/api/users"

/**
 * Store
 */
import { useAccountStore } from "@/store/account"
import { useNotificationsStore } from "@/store/notifications"
const accountStore = useAccountStore()
const notificationsStore = useNotificationsStore()
const { setupUser } = useMarket()

const router = useRouter()

/** Meta */
useMeta({
	title: "Connect Wallet",
	description:
		"Liquidity provider leaderboard based on perfomance & earnings",
})

const handleBeacon = async () => {
	try {
		await juster.sdk.sync()
		login()
	} catch (error) {
		if (error.title === "Aborted") {
			notificationsStore.create({
				notification: {
					type: "Warning",
					title: "Wallet connection rejected",
					description: "Try again.",
					autoDestroy: true,
				},
			})
		}
	}
}

const login = () => {
	juster.sdk._provider.client.getActiveAccount().then(async (account) => {
		analytics.log("login", { address: account.address })

		accountStore.pkh = account.address
		accountStore.updateBalance()

		setupUser()

		router.push("/")
	})
}

/**
 * Custom RPC Login
 */
const showCustomLoginModal = ref(false)
const handleCustomLogin = () => {
	showCustomLoginModal.value = true
}
const handleSelectCustomNode = async (node) => {
	await juster.sdk._provider.requestPermissions({
		network: {
			type: NetworkType.CUSTOM,
			name: node.value.name,
			rpcUrl: node.value.url,
		},
	})
	login()
}

const handleLogout = () => {
	accountStore.logout()
	router.push("/connect")
	notificationsStore.create({
		notification: {
			icon: "logout",
			title: "You are signed out",
			description:
				"To work with the application, you definitely need an account :)",
			autoDestroy: true,

			actions: [
				{
					name: "Back to Connection page",
					callback: () => router.push("/connect"),
				},
			],
		},
	})
}
const allUsersCounter = ref(0)

onMounted(async () => {
	allUsersCounter.value = await fetchAllUsers()
})
</script>

<template>
	<div :class="$style.wrapper">
		<metainfo>
			<template v-slot:title="{ content }"
				>{{ content }} • Juster</template
			>
		</metainfo>

		<CustomLoginModal
			:show="showCustomLoginModal"
			@onSelectCustomNode="handleSelectCustomNode"
			@onClose="showCustomLoginModal = false"
		/>

		<div :class="$style.base">
			<div :class="$style.title">
				{{
					!accountStore.isLoggined
						? "Connect Wallet"
						: "Already Connected"
				}}
			</div>

			<Tooltip v-if="!accountStore.isLoggined" placement="top">
				<div :class="$style.description">
					By continuing, you agree to
					<router-link to="/terms" target="_blank"
						>Terms of Use</router-link
					>
					and to the age limit of 21*
				</div>

				<template #content
					>Please note that the age limit may vary from country to
					country</template
				>
			</Tooltip>
			<div v-else :class="$style.description">
				Do you want to use a different wallet? Logout and connect with
				the desired wallet
			</div>

			<div v-if="!accountStore.isLoggined" :class="$style.buttons">
				<Button @click="handleBeacon" type="primary" size="large" block>
					<Icon name="beacon" size="16" />
					Beacon Wallet
				</Button>
				<Button
					@click="handleCustomLogin"
					type="secondary"
					size="large"
					block
				>
					<Icon name="settings" size="16" />Custom Connection</Button
				>
			</div>
			<div v-else :class="$style.buttons">
				<router-link :to="`/profile/${accountStore.pkh}`">
					<Button type="primary" size="large" block>
						<Icon name="grid" size="16" />Go to my profile</Button
					>
				</router-link>
				<Button
					@click="handleLogout"
					type="secondary"
					size="large"
					block
				>
					<Icon name="logout" size="16" />Logout</Button
				>
			</div>

			<div :class="$style.divider" />

			<div :class="$style.labels">
				<div
					v-if="currentNetwork !== 'mainnet'"
					:class="[$style.label, $style.yellow]"
				>
					<Icon name="hammer" size="14" />
					<span>
						<b>Test Network.</b> Use only testing and exploring
						opportunities
					</span>
				</div>
				<div :class="$style.label">
					<Icon name="eye" size="14" />
					<span
						><b>View only permissions.</b> We will never do anything
						without your approval</span
					>
				</div>
				<div v-if="currentNetwork === 'mainnet'" :class="$style.label">
					<Icon name="lock" size="14" />
					<span>
						<b>Secure smart contracts.</b> Audited by Baking Bad
						Security 34 days ago
					</span>
				</div>
				<div :class="$style.label">
					<Icon name="users" size="14" />
					<span>
						Trusted by <b>{{ allUsersCounter.length }}</b> Users
						{{ currentNetwork !== "mainnet" && "(Testnet)" }}
					</span>
				</div>
			</div>
		</div>
	</div>
</template>

<style module>
.wrapper {
	display: flex;
	justify-content: center;

	margin-top: 160px;
}

.base {
	display: flex;
	align-items: center;
	flex-direction: column;

	max-width: 350px;
}

.title {
	font-size: 22px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-primary);

	margin-bottom: 16px;
}

.description {
	font-size: 14px;
	line-height: 1.4;
	font-weight: 500;
	color: var(--text-tertiary);
	text-align: center;
	box-sizing: content-box;

	max-width: 300px;
}

.description a {
	color: var(--text-blue);
}

.buttons {
	width: 100%;

	display: flex;
	flex-direction: column;
	gap: 16px;

	margin-top: 40px;
}

.divider {
	width: 100%;
	height: 1px;
	background: var(--border);

	margin: 40px 0 24px 0;
}

.labels {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.label {
	display: flex;
	gap: 12px;
}

.label.yellow svg {
	fill: var(--yellow);
}

.label svg {
	fill: var(--text-tertiary);

	margin-top: 2px;
}

.label span {
	font-size: 12px;
	line-height: 17px;
	font-weight: 500;
	color: var(--text-tertiary);
}

.label span b {
	color: var(--text-secondary);
	font-weight: 600;
}
</style>
