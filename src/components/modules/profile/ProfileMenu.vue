<script setup>
/** Vendor */
import { useRouter } from "vue-router"
import { useTonConnectUI, useTonAddress } from "@townsquarelabs/ui-vue"

/**
 * Components: UI
 */
import { Dropdown } from "@ui/Dropdown"

/**
 * Services
 */
import { shorten } from "@utils/misc"
import { numberWithSymbol } from "@utils/amounts"
import { analytics } from "@sdk"

/**
 * Store
 */
import { useAccountStore } from "@store/account"
import { useNotificationsStore } from "@store/notifications"
import { token } from "@config"

const accountStore = useAccountStore()
const notificationsStore = useNotificationsStore()
const [tonConnectUI] = useTonConnectUI()
const userFriendlyAddress = useTonAddress()

const router = useRouter()

const handleOpenProfile = () => {
	router.push("/profile")

	analytics.log("openProfile")
}

const handleOpenWithdrawals = () => {
	router.push("/withdrawals")

	analytics.log("openWithdrawals")
}

const handleLogout = async () => {
	/** confirmation.request -> onConfirm -> callback */
	await tonConnectUI.disconnect()
	accountStore.logout()
	location.reload()
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
</script>

<template>
	<Dropdown width="270" :class="$style.wrapper" disable-autofocus>
		<template #trigger>
			<slot />
		</template>

		<template #dropdown>
			<Flex direction="column">
				<Flex direction="column" gap="2" :class="$style.general_links">
					<Flex @click="handleOpenProfile" align="center" gap="12" :class="$style.general_link" tabindex="1">
						<Icon name="user" size="20" :class="$style.icon" />

						<Flex direction="column" gap="8">
							<Text size="13" weight="600" color="primary"> My Profile </Text>
							<Text size="11" weight="600" color="tertiary">
								{{ shorten(userFriendlyAddress, 4, 4) }}
							</Text>
						</Flex>
					</Flex>

					<Flex @click="handleOpenWithdrawals" align="center" gap="12" :class="$style.general_link" tabindex="1">
						<Icon name="money" size="20" :class="$style.icon" />

						<Flex direction="column" gap="6">
							<Text size="13" weight="600" color="primary">
								<Flex>
									{{ numberWithSymbol(accountStore.balance, ",") }}&nbsp;
									<Text color="tertiary">{{token.symbol}}</Text>
								</Flex>
							</Text>
							<Text size="11" weight="600" color="tertiary"> Manage your assets </Text>
						</Flex>
					</Flex>

					<!-- <Flex
						align="center"
						gap="12"
						:class="[$style.general_link, $style.disabled]"
						tabindex="-1"
					>
						<Icon name="grid" size="20" :class="$style.icon" />

						<Flex direction="column" gap="8">
							<Text size="13" weight="600" color="primary">
								Dashboard
							</Text>
							<Text size="11" weight="600" color="tertiary">
								Unavailable Now
							</Text>
						</Flex>
					</Flex> -->
				</Flex>

				<Flex direction="column" :class="$style.links">
					<!-- <Flex
						align="center"
						gap="8"
						:class="[$style.link, $style.disabled]"
						tabindex="1"
					>
						<Icon name="settings" size="16" />
						<Text size="13" color="primary" weight="500">
							Settings
						</Text>
					</Flex> -->
					<Flex @click="handleLogout" align="center" gap="8" :class="$style.link" tabindex="1">
						<Icon name="logout" size="16" />
						<Text size="13" color="primary" weight="500"> Logout </Text>
					</Flex>
				</Flex>
			</Flex>
		</template>
	</Dropdown>
</template>

<style module>
.wrapper {
}

.general_links {
	border-radius: 6px;
	overflow: hidden;

	margin: 4px 12px;
}

.general_link {
	width: 100%;
	background: rgba(255, 255, 255, 0.05);

	padding: 12px;

	transition: background 200ms ease;
}

.general_link.disabled {
	pointer-events: none;
	opacity: 0.5;
}

.general_link:hover {
	background: rgba(255, 255, 255, 0.1);
}

.general_link:focus {
	outline: none;
	background: rgba(255, 255, 255, 0.1);
}

.general_link img {
	width: 32px;
	height: 32px;
	border-radius: 50%;
}

.icon {
	padding: 6px;
	box-sizing: content-box;

	fill: var(--text-primary);
}

.links {
	margin: 8px 12px;
}

.link {
	height: 36px;
	border-radius: 6px;

	padding: 0 8px;

	transition: background 200ms ease;
}

.link.disabled {
	pointer-events: none;
	opacity: 0.5;
}

.link:hover {
	background: rgba(255, 255, 255, 0.05);
}

.link:focus {
	outline: none;
	background: rgba(255, 255, 255, 0.05);
}

.link svg {
	fill: var(--text-secondary);
}
</style>
