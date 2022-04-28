<script setup>
/**
 * UI
 */
import Button from "@/components/ui/Button"
import {
	Dropdown,
	DropdownItem,
	DropdownDivider,
} from "@/components/ui/Dropdown"

/**
 * Services
 */
import { currentNetwork } from "@/services/sdk"
import { toClipboard } from "@/services/utils/global"
import { verifiedMakers } from "@/services/config"

/**
 * Store
 */
import { useAccountStore } from "@/store/account"
import { useNotificationsStore } from "@/store/notifications"

const props = defineProps({ user: { type: Object } })

const accountStore = useAccountStore()
const notificationsStore = useNotificationsStore()

const handleCopy = (target) => {
	if (target == "address") {
		notificationsStore.create({
			notification: {
				type: "success",
				title: "User address copied to clipboard",
				description: "Use Ctrl+V to paste",
				autoDestroy: true,
			},
		})
		toClipboard(props.user.userId)
	}
	if (target == "url") {
		notificationsStore.create({
			notification: {
				type: "success",
				title: "Profile URL copied to clipboard",
				description: "Use Ctrl+V to paste",
				autoDestroy: true,
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
					name="logo_symbol"
					size="24"
					:class="$style.logo_icon"
				/>

				<Icon
					v-if="
						user.creator ||
						verifiedMakers[currentNetwork].includes(user.userId)
					"
					name="verified"
					size="14"
					:class="$style.verified_icon"
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
						Juster
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

					<Icon name="copy" size="14" />
				</div>

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
								(
									user.liquidityProvidedBelow +
									user.liquidityProvidedAboveEq
								).toFixed(2)
							}}
							ꜩ</span
						>
					</div>
				</div>
			</div>
		</div>

		<Dropdown>
			<template v-slot:trigger>
				<Button type="tertiary" size="small" icon="dots" />
			</template>

			<template v-slot:dropdown>
				<router-link :to="`/profile/${user.userId}`">
					<DropdownItem
						><Icon name="open" size="16" />Open User
						profile</DropdownItem
					>

					<DropdownDivider />
				</router-link>

				<a
					:href="`https://${
						currentNetwork == 'mainnet' ? '' : 'ithacanet.'
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
	min-height: 50px;
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
	border-radius: 50%;
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

	fill: var(--text-secondary);
}

.avatar img {
	width: 28px;
	height: 28px;
	border-radius: 50%;
}

.base {
	display: flex;
	flex-direction: column;
	gap: 4px;
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
	background: var(--border);
}
</style>
