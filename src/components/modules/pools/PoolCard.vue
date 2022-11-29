<script setup>
/**
 * UI
 */
import Button from "@ui/Button.vue"
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
import { toClipboard, getCurrencyIcon, shorten } from "@utils/misc"

/**
 * Store
 */
import { useAccountStore } from "@store/account"
import { useNotificationsStore } from "@store/notifications"

const accountStore = useAccountStore()
const notificationsStore = useNotificationsStore()

const props = defineProps({
	pool: {
		type: Object,
		required: true,
	},
	state: {
		type: Object,
	},
})
const emit = defineEmits(["onSelectPool"])

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

		toClipboard(props.pool.address)
	}
}
</script>

<template>
	<Flex direction="column" gap="32" :class="$style.wrapper">
		<Flex justify="between">
			<Flex align="center" gap="16">
				<div :class="$style.symbols">
					<img :src="getCurrencyIcon('XTZ')" alt="symbol" />
					<img :src="getCurrencyIcon('USD')" alt="symbol" />
				</div>

				<Flex direction="column" gap="8">
					<Text size="14" color="primary" weight="600">
						{{ pool.name.replace("Juster Pool: ", "") }}
					</Text>

					<Flex align="center" gap="8">
						<Flex align="center" gap="4">
							<Icon name="zap_circle" size="12" color="green" />
							<Text size="12" weight="600" color="green">
								Stable
							</Text>
						</Flex>

						<Text size="8" color="support">✦</Text>

						<Text size="12" weight="600" color="tertiary">
							Pool
						</Text>
					</Flex>
				</Flex>
			</Flex>

			<Flex gap="8">
				<Button
					@click="emit('onSelectPool', pool)"
					type="secondary"
					size="small"
				>
					<Icon name="plus_circle" size="16" color="blue" />
					Deposit
				</Button>

				<Dropdown>
					<template #trigger>
						<Button type="secondary" size="small">
							<Icon name="dots" size="12" />
						</Button>
					</template>

					<template #dropdown>
						<DropdownItem>
							<Icon name="money" size="16" /> Request funds
						</DropdownItem>

						<DropdownDivider />

						<a
							:href="`https://ghostnet.tzkt.io/${pool.address}`"
							target="_blank"
						>
							<DropdownItem>
								<Icon name="database" size="16" />
								View in explorer
							</DropdownItem>
						</a>
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
					</template>
				</Dropdown>
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
						>TVL</Text
					>

					<Flex align="center" gap="6">
						<Icon name="coins" size="14" color="secondary" />

						<Text
							v-if="state"
							size="15"
							weight="600"
							color="secondary"
						>
							{{ state.totalLiquidity.toFixed(2) }}
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

				<!-- Share Price -->
				<Flex direction="column" gap="8" :class="$style.stat">
					<Text
						size="13"
						weight="600"
						color="tertiary"
						:class="$style.stat__title"
					>
						Share Price
					</Text>

					<Flex align="center" gap="6">
						<Icon name="banknote" size="14" color="secondary" />

						<Text
							v-if="state"
							size="15"
							weight="600"
							color="secondary"
						>
							{{ state.sharePrice.toFixed(2) }}
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
						>APY</Text
					>

					<Flex align="center" gap="6">
						<Icon name="stars" size="14" color="green" />
						<Text size="15" weight="600" color="secondary">
							0%
						</Text>
					</Flex>
				</Flex>

				<!-- Switch Button -->
				<Flex
					v-if="accountStore.pkh"
					align="center"
					gap="8"
					:class="$style.switch_btn"
				>
					<Icon name="arrows" size="16" color="secondary" />
					<Text
						size="12"
						weight="700"
						color="secondary"
						:class="$style.switch_btn__text"
					>
						Switch to my statistics
					</Text>
					<img
						:src="`https://services.tzkt.io/v1/avatars/${accountStore.pkh}`"
						alt="avatar"
					/>
				</Flex>
			</Flex>

			<Flex align="center" gap="24" :class="$style.stats">
				<Flex direction="column" gap="8" :class="$style.stat">
					<Text
						size="13"
						weight="600"
						color="tertiary"
						:class="$style.stat__title"
						>Events</Text
					>

					<Flex align="center" gap="6">
						<Icon name="price_event" size="14" color="secondary" />
						<Text size="15" weight="600" color="secondary">
							2
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
						>Stake Index</Text
					>

					<Flex align="center" gap="6">
						<Icon name="checkcircle" size="14" color="green" />
						<Text size="15" weight="600" color="secondary">
							100%
						</Text>
					</Flex>
				</Flex>
			</Flex>
		</Flex>

		<!-- <Flex justify="between">
			<Flex direction="column" gap="8">
				<Flex align="center" gap="6">
					<Icon name="pool" size="12" color="tertiary" />
					<Text size="13" weight="600" color="tertiary">
						Liquidity Pool
					</Text>
				</Flex>

				<Text size="12" color="support" weight="600">
					Smart Contract&nbsp;&nbsp;•&nbsp;&nbsp;24 participants
				</Text>
			</Flex>

			<Flex align="center" gap="8">
				<Button type="secondary" size="small">
					<Icon name="database" size="12" />
				</Button>
				<Button type="secondary" size="small">
					<Icon name="dots" size="12" />
				</Button>
			</Flex>
		</Flex> -->
	</Flex>
</template>

<style module>
.wrapper {
	border-radius: 10px;
	background: var(--card-bg);
	border: 1px solid transparent;
	cursor: pointer;

	padding: 24px;

	transition: border 0.2s ease;
}

.wrapper:hover {
	border: 1px solid var(--border);
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

	padding: 14px 16px;
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

.switch_btn svg {
	transform: rotate(90deg);
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
