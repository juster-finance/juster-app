<script setup>
/** Vendor */
import { useRouter } from "vue-router"

/**
 * Components: UI
 */
import { Dropdown } from "@/components/ui/Dropdown"

/**
 * Services
 */
import { shorten } from "@/services/utils/global"
import { analytics } from "@/services/sdk"

/**
 * Store
 */
import { useAccountStore } from "@/store/account"
import { useNotificationsStore } from "@/store/notifications"

const accountStore = useAccountStore()
const notificationsStore = useNotificationsStore()

const router = useRouter()

const handleOpenProfile = () => {
	router.push("/profile")

	analytics.log("openProfile")
}

const handleOpenWithdrawals = () => {
	router.push("/withdrawals")

	analytics.log("openWithdrawals")
}

const handleOpenReleases = () => {
	router.push("/releases")

	analytics.log("openReleases")
}

const handleLogout = () => {
	/** confirmation.request -> onConfirm -> callback */
	accountStore.logout()
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
</script>

<template>
	<Dropdown width="270" :class="$style.wrapper">
		<template #trigger>
			<slot />
		</template>

		<template #dropdown>
			<Flex direction="column">
				<Flex direction="column" gap="2" :class="$style.general_links">
					<Flex
						@click="handleOpenProfile"
						align="center"
						gap="12"
						:class="$style.general_link"
					>
						<img
							:src="`https://services.tzkt.io/v1/avatars/${accountStore.pkh}`"
							alt="avatar"
						/>

						<Flex direction="column" gap="8">
							<Text size="13" weight="600" color="primary">
								My Profile
							</Text>
							<Text size="11" weight="600" color="tertiary">
								{{ shorten(accountStore.pkh, 8, 5) }}
							</Text>
						</Flex>
					</Flex>

					<Flex
						align="center"
						gap="12"
						:class="[$style.general_link, $style.disabled]"
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
					</Flex>

					<Flex
						@click="handleOpenWithdrawals"
						align="center"
						gap="12"
						:class="$style.general_link"
					>
						<Icon name="money" size="20" :class="$style.icon" />

						<Flex direction="column" gap="8">
							<Text size="13" weight="600" color="primary">
								Assets
							</Text>
							<Text size="11" weight="600" color="tertiary">
								Manage your withdrawals
							</Text>
						</Flex>
					</Flex>
				</Flex>

				<Flex direction="column" :class="$style.links">
					<Flex align="center" gap="8" :class="$style.link">
						<Icon name="settings" size="16" />
						<Text size="13" color="primary" weight="500">
							Settings
						</Text>
					</Flex>
					<Flex
						@click="handleOpenReleases"
						align="center"
						gap="8"
						:class="$style.link"
					>
						<Icon name="spark" size="16" />
						<Text size="13" color="primary" weight="500">
							What's New
						</Text>
					</Flex>
					<Flex
						@click="handleLogout"
						align="center"
						gap="8"
						:class="$style.link"
					>
						<Icon name="logout" size="16" />
						<Text size="13" color="primary" weight="500">
							Logout
						</Text>
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

.link:hover {
	background: rgba(255, 255, 255, 0.05);
}

.link svg {
	fill: var(--text-secondary);
}
</style>
