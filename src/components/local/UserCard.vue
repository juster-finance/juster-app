<script setup>
/**
 * UI
 */
import Button from "@ui/Button.vue"
import { Dropdown, DropdownItem, DropdownDivider } from "@ui/Dropdown"

/**
 * Services
 */
import { currentNetwork } from "@sdk"
import { toClipboard, shorten } from "@utils/global"
import { verifiedMakers } from "@config"

/**
 * Store
 */
import { useAccountStore } from "@store/account"
import { useNotificationsStore } from "@store/notifications"

const props = defineProps({ user: { type: Object, default: () => {} } })

const accountStore = useAccountStore()
const notificationsStore = useNotificationsStore()

const handleCopy = (target) => {
	if (target == "address") {
		notificationsStore.create({
			notification: {
				icon: "copy",
				title: "User address copied to clipboard",
				autoDestroy: true,

				badges: [
					{
						icon: "user",
						secondaryText: shorten(props.user.userId, 10, 6),
					},
				],
			},
		})
		toClipboard(props.user.userId)
	}
	if (target == "url") {
		notificationsStore.create({
			notification: {
				icon: "copy",
				title: "Profile URL copied to clipboard",
				autoDestroy: true,

				actions: [
					{
						name: "Open in new tab",
						callback: () =>
							window.open(
								`https://app.juster.fi/profile/${props.user.userId}`,
								"_blank",
							),
					},
				],
			},
		})
		toClipboard(`https://app.juster.fi/profile/${props.user.userId}`)
	}
}
</script>

<template>
	<div :class="$style.wrapper">
		<div :class="$style.left">
			<div :class="$style.avatar">
				<img
					v-if="!verifiedMakers[currentNetwork].includes(user.userId)"
					:src="`https://services.tzkt.io/v1/avatars/${user.userId}`"
					alt="avatar"
				/>
				<Icon
					v-else
					:name="user.creator ? 'bolt' : 'server'"
					size="20"
					:class="$style.logo_icon"
				/>
			</div>

			<div :class="$style.base">
				<div @click="handleCopy('address')" :class="$style.address">
					<!-- By Juster -->
					<template
						v-if="
							verifiedMakers[currentNetwork].includes(user.userId)
						"
					>
						{{ user.creator ? "Event Maker" : "Liquidity Pool" }}
					</template>
					<!-- User -->
					<template v-else-if="user.userId !== accountStore.pkh">
						{{
							`${user.userId.slice(0, 8)}..${user.userId.slice(
								user.userId.length - 3,
								user.userId.length,
							)}`
						}}
					</template>
					<template v-else>You</template>
				</div>

				<!-- Description -->
				<div
					v-if="
						user.shares &&
						user.liquidityProvidedAboveEq &&
						user.liquidityProvidedBelow
					"
					:class="$style.params"
				>
					<div :class="$style.param">
						Shares: <span>{{ user.shares.toFixed(2) }}</span>
					</div>
					<div :class="$style.dot" />
					<div :class="$style.param">
						Liquidity:
						<span
							>{{
								user.liquidityProvidedBelow.toFixed(2)
							}}
							ꜩ</span
						>
					</div>
				</div>
				<div v-else-if="user.creator" :class="$style.params">
					<div :class="$style.param">Smart Contract</div>
					<div :class="$style.dot" />
					<div :class="$style.param">Recurring Events</div>
				</div>
			</div>
		</div>

		<Dropdown>
			<template #trigger>
				<Button type="tertiary" size="small" icon="dots" />
			</template>

			<template #dropdown>
				<router-link :to="`/profile/${user.userId}`">
					<DropdownItem
						><Icon name="open" size="16" />User
						profile</DropdownItem
					>

					<DropdownDivider />
				</router-link>

				<a
					:href="`https://${
						currentNetwork === 'mainnet' ? '' : 'ghostnet.'
					}tzkt.io/${user.userId}`"
					target="_blank"
				>
					<DropdownItem
						><Icon name="open" size="16" />View on TzKT
					</DropdownItem>
				</a>

				<DropdownDivider />

				<DropdownItem @click="handleCopy('address')"
					><Icon name="copy" size="16" />Copy address
				</DropdownItem>
				<DropdownItem @click="handleCopy('url')"
					><Icon name="copy" size="16" />Copy URL
				</DropdownItem>
			</template>
		</Dropdown>
	</div>
</template>

<style module>
.wrapper {
	display: flex;
	align-items: center;
	justify-content: space-between;

	border-radius: 8px;
	background: rgba(255, 255, 255, 0.05);
	min-height: 56px;
	padding: 0 10px;
}

.left {
	display: flex;
	align-items: center;
	gap: 10px;
}

.avatar {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;

	width: 32px;
	height: 32px;
	background: var(--modal-bg);
	border-radius: 8px;
}

.verified_icon {
	position: absolute;
	top: 0px;
	right: 0px;

	fill: var(--orange);
	background: var(--card-bg);
	border-radius: 50%;
}

.logo_icon {
	padding: 2px;

	fill: var(--brand);
}

.avatar img {
	width: 20px;
	height: 20px;
	border-radius: 50%;
}

.base {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.address {
	display: flex;
	align-items: center;
	gap: 6px;

	cursor: pointer;

	font-size: 13px;
	line-height: 1.1;
	font-weight: 600;
	color: var(--text-primary);
	fill: var(--text-tertiary);
}

.params {
	display: flex;
	align-items: center;
	gap: 8px;
}

.param {
	font-size: 12px;
	line-height: 1;
	font-weight: 500;
	color: var(--text-tertiary);
}

.param span {
	color: var(--text-secondary);
}

.dot {
	width: 4px;
	height: 4px;
	border-radius: 50%;
	background: var(--text-tertiary);
}
</style>
