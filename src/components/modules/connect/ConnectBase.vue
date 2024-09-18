<script setup>
/**
 * Vendor
 */
import { ref, onMounted } from "vue"
import { useMeta } from "vue-meta"
import { useTonConnectModal, useTonConnectUI } from '@townsquarelabs/ui-vue';
import { useRouter } from "vue-router"

/**
 * UI
 */
import Button from "@ui/Button.vue"
import Tooltip from "@ui/Tooltip.vue"

/**
 * Modals
 */
import CustomLoginModal from "@local/modals/CustomLoginModal.vue"

/**
 * Services
 */
import { juster, analytics, currentNetwork } from "@sdk"
import { toUserFriendlyAddress } from "@utils/address"

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
import { useAppStore } from "@store/app"
import { useAccountStore } from "@store/account"
import { useNotificationsStore } from "@store/notifications"
import { demoMode, token } from "@config";

import { numberWithSymbol } from "@utils/amounts"

const appStore = useAppStore()
const accountStore = useAccountStore()
const notificationsStore = useNotificationsStore()
const { open: openTonConnectModal } = useTonConnectModal()
const [tonConnectUI] = useTonConnectUI()

const { setupUser } = useMarket()

const router = useRouter()

/** Meta */
useMeta({
	title: "Connect Wallet",
	description:
		"Liquidity provider leaderboard based on perfomance & earnings",
})

const handleTonConnect = async () => {
	try {
		openTonConnectModal()
		// login()
	} catch (error) {
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

const login = () => {
	juster.sdk._provider.client.getActiveAccount().then(async (account) => {
		analytics.log("login", { address: account.address })

		accountStore.pkh = account.address
		accountStore.updateBalance()

		setupUser()

		/** Onboarding redirect */
		if (!localStorage.isOnbShown) {
			router.push("/welcome")

			notificationsStore.create({
				notification: {
					type: "success",
					title: "Successfuly connected",
					description:
						"Go through a little onboarding to quickly explore the features of the project",
					autoDestroy: true,

					actions: [
						{
							name: "Skip Onboarding",
							callback: () => router.push("/explore"),
						},
					],
				},
			})
		} else {
			router.push(appStore.prevRoute ? appStore.prevRoute.path : "/")

			notificationsStore.create({
				notification: {
					type: "success",
					title: "Successfuly connected",
					description:
						"Wallet is connected and we recovered the previous page before login",
					autoDestroy: true,

					actions: [
						{
							name: "Go to Explore",
							callback: () => router.push("/"),
						},
					],
				},
			})
		}
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
	// TODO: #1
	// await juster.sdk._provider.requestPermissions({
	// 	network: {
	// 		type: NetworkType.CUSTOM,
	// 		name: node.value.name,
	// 		rpcUrl: node.value.url,
	// 	},
	// })
	// login()
}

const handleLogout = async () => {
	await tonConnectUI.disconnect()
	accountStore.logout()
	notificationsStore.create({
		notification: {
			icon: "logout",
			title: "You are signed out",
			description: "If you need to change your account, use the settings",
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
			<template #title="{ content }">{{ content }} • Juster</template>
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
			<template v-if="!accountStore.isLoggined">
				<div :class="$style.subtitle">
					Demo mode
				</div>
				<div :class="$style.description">
					New users start with {{ numberWithSymbol(demoMode.newUserBalance, ',') }} {{ token.symbol }} and can repeatedly refill another {{ numberWithSymbol(demoMode.topUpAmount, ',') }} {{ token.symbol }} whenever the balance is less then {{ numberWithSymbol(demoMode.minBalanceToTopUp, ',') }} {{ token.symbol }}.
				</div>
			</template>

			<div v-if="!accountStore.isLoggined" :class="$style.buttons">
				<Button
					@click="handleTonConnect"
					@onKeybind="handleTonConnect"
					type="primary"
					size="large"
					block
					keybind="T"
				>
					<Icon name="login" size="16" />
					Ton Connect
				</Button>
				<!--<Button
					@click="handleCustomLogin"
					@onKeybind="handleCustomLogin"
					type="secondary"
					size="large"
					block
					keybind="C"
				>
					<Icon name="settings" size="16" />Custom Connection</Button
				>-->
			</div>
			<div v-else :class="$style.buttons">
				<router-link :to="`/profile/${toUserFriendlyAddress(accountStore.pkh)}`">
					<Button
						@onKeybind="router.push(`/profile/${toUserFriendlyAddress(accountStore.pkh)}`)"
						type="secondary"
						size="large"
						block
						keybind="P"
					>
						<Icon name="grid" size="16" />Go to my profile</Button
					>
				</router-link>
				<Button
					@click="handleLogout"
					@onKeybind="handleLogout"
					type="secondary"
					size="large"
					block
					keybind="L"
				>
					<Icon name="logout" size="16" />Logout
				</Button>
			</div>

			<div :class="$style.divider" />

			<div :class="$style.labels">
				<div
					v-if="currentNetwork !== 'mainnet'"
					:class="[$style.label]"
				>
					<Icon name="hammer" size="14" color="yellow" />
					<span>
						<b>Test Network.</b> Use only testing and exploring
						opportunities
					</span>
				</div>
				<div :class="$style.label">
					<Icon name="eye" size="14" color="tertiary" />
					<span>
						<b>View only permissions.</b> We will never do anything
						without your approval
					</span>
				</div>
				<div :class="$style.label">
					<Icon name="users" size="14" color="tertiary" />
					<span>
						Used by <b>{{ allUsersCounter.length }}</b> Users
						{{ currentNetwork !== "mainnet" ? "(Testnet)" : "" }}
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

.subtitle {
	font-size: 18px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-primary);

	margin-top: 32px;
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

.label svg {
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

@media (max-height: 1200px) {
	.wrapper {
		margin-top: 80px;
	}
}

@media (max-height: 1000px) {
	.wrapper {
		margin-top: 40px;
	}
}
</style>
