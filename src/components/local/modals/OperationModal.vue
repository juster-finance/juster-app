<script setup>
import { ref, watch } from "vue"
import { DateTime } from "luxon"

/**
 * UI
 */
import Modal from "@ui/Modal.vue"
import Button from "@ui/Button.vue"

/**
 * Services
 */
import { shorten, toClipboard } from "@utils/misc"
import { numberWithSymbol } from "@utils/amounts"
import { currentNetwork } from "@sdk"

/**
 * Store
 */
import { useNotificationsStore } from "@store/notifications"
import { useMarketStore } from "@store/market"

const notificationsStore = useNotificationsStore()
const marketStore = useMarketStore()

const props = defineProps({
	show: { type: Boolean },
	data: { type: Object, default: () => {} },
})

const isPriceHovered = ref(false)

const showRadialBg = ref(false)
watch(
	() => props.show,
	() => {
		if (!props.show) {
			showRadialBg.value = false
		} else {
			setTimeout(() => {
				showRadialBg.value = true
			}, 100)
		}
	},
)

const handleCopy = (target, name) => {
	notificationsStore.create({
		notification: {
			icon: "copy",
			title: "Successfully copied to clipboard",
			autoDestroy: true,

			badges: [
				{
					secondaryText:
						name === "hash" ? shorten(target, 6, 6) : target,
					icon: name === "hash" ? "hash" : "calendar",
				},
			],
		},
	})

	toClipboard(target)
}

const disaggregate = (num) => {
	const splittedNum = num.toString().split(".")

	const integer = splittedNum[0]
	const fraction = splittedNum[1]?.slice(0, 2)

	return [numberWithSymbol(integer, ","), fraction]
}

const getTypeOfOperation = () => {
	if (props.data.reward !== undefined) {
		return "Bid"
	} else if (props.data.shares !== undefined) {
		return "Deposit"
	} else if (props.data.feeCollectorId !== undefined) {
		return "Withdraw"
	}
}
</script>

<template>
	<Modal :show="show" width="500" new closable @onClose="$emit('onClose')">
		<div :class="$style.wrapper">
			<Flex align="center" justify="between" :class="$style.head">
				<Flex align="center" gap="8">
					<Icon name="explorer" size="16" color="secondary" />

					<Text size="14" weight="600" color="primary">
						Operation
					</Text>
				</Flex>

				<Icon
					@click="$emit('onClose')"
					name="close"
					size="16"
					color="tertiary"
					:class="$style.close_icon"
				/>
			</Flex>

			<Flex direction="column" gap="32" :class="$style.base">
				<div
					@mouseenter="isPriceHovered = true"
					@mouseleave="isPriceHovered = false"
					:class="$style.content"
				>
					<div :class="$style.center_icon">
						<Icon name="check_circle_right" size="32" />
					</div>

					<router-link
						:to="`/profile/${data.userId}`"
						target="_blank"
						:class="$style.type"
					>
						<Icon
							:name="
								(getTypeOfOperation() == 'Bid' && 'money') ||
								(getTypeOfOperation() == 'Deposit' &&
									'liquidity') ||
								(getTypeOfOperation() == 'Withdraw' &&
									'walletadd')
							"
							size="14"
						/>
						{{ getTypeOfOperation() }} <span>by</span>
						{{ shorten(data.userId, 4, 4) }}
					</router-link>

					<div :class="$style.amount">
						{{
							disaggregate(
								data.amount ? data.amount : data.amountBelow,
							)[0]
						}}<span>
							<template
								v-if="
									disaggregate(
										data.amount
											? data.amount
											: data.amountBelow,
									)[1]
								"
								>.</template
							>{{
								disaggregate(
									data.amount
										? data.amount
										: data.amountBelow,
								)[1]
							}}
							ꜩ
						</span>
					</div>

					<div :class="$style.usd">
						<template v-if="!isPriceHovered">
							~ ${{
								numberWithSymbol(
									(data.amount
										? data.amount *
										  marketStore.markets["XTZ-USD"]
												.quotes[0].price
										: data.amountBelow *
										  marketStore.markets["XTZ-USD"]
												.quotes[0].price
									).toFixed(2),
									",",
								)
							}}
						</template>
						<template v-else>
							1 XTZ = ${{
								marketStore.markets[
									"XTZ-USD"
								].quotes[0].price.toFixed(2)
							}}
						</template>
					</div>
				</div>

				<div :class="$style.details">
					<div :class="$style.subtitle">Details</div>

					<!-- Hash -->
					<div :class="$style.detail">
						<div :class="$style.key">
							<Icon name="hash" size="12" />Hash
						</div>
						<div
							@click="handleCopy(data.opgHash, 'hash')"
							:class="$style.value"
						>
							{{ shorten(data.opgHash, 6, 6) }}
						</div>
					</div>

					<!-- Date -->
					<div :class="$style.detail">
						<div :class="$style.key">
							<Icon name="calendar" size="12" />When
						</div>
						<div
							@click="handleCopy(data.createdTime)"
							:class="$style.value"
						>
							{{
								DateTime.fromISO(data.createdTime, "calendar")
									.setLocale("en")
									.toFormat("T, dd LLLL yyyy")
							}}
						</div>
					</div>
				</div>

				<a
					:href="`https://${
						currentNetwork === 'mainnet' ? '' : 'ghostnet.'
					}tzkt.io/${data.opgHash}`"
					target="_blank"
				>
					<Button type="secondary" size="small" block>
						<Icon name="arrowrighttop" size="12" color="tertiary" />
						View operation on TzKT
					</Button>
				</a>

				<div :class="[$style.bg, showRadialBg && $style.visible]" />
			</Flex>
		</div>
	</Modal>
</template>

<style module>
.wrapper {
	position: relative;
}

.head {
	height: 56px;

	padding: 0 20px;
}

.base {
	padding: 8px 20px 20px 20px;
}

.close_icon {
	cursor: pointer;
}

.bg {
	width: 500px;
	height: 500px;
	border-radius: 50%;
	position: absolute;
	top: 0;
	left: -32px;

	background: var(--green);
	opacity: 0;
	filter: blur(200px);
	pointer-events: none;

	transform: translateY(-50%);
	transition: opacity 0.2s ease;
}

.bg.visible {
	opacity: 0.1;
}

.title {
	font-size: 20px;
	font-weight: 600;
	line-height: 1.2;
	color: var(--text-primary);

	margin-bottom: 16px;
}

.content {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.center_icon {
	display: flex;

	border-radius: 50%;
	fill: var(--green);
	box-shadow: 0px 0px 30px rgba(26, 161, 104, 0.8);

	animation: pulse 2s infinite;

	margin-bottom: 40px;
}

@keyframes pulse {
	0% {
		box-shadow: 0 0 0 0 rgba(26, 161, 104, 0.8);
	}
	70% {
		box-shadow: 0 0 0 15px rgba(26, 161, 104, 0);
	}
	100% {
		box-shadow: 0 0 0 0 rgba(26, 161, 104, 0);
	}
}

.type {
	display: flex;
	align-items: center;
	gap: 6px;

	background: rgba(255, 255, 255, 0.05);
	padding: 6px 8px;
	border-radius: 50px;

	font-size: 13px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-secondary);
	fill: var(--text-tertiary);

	margin-bottom: 20px;
}

.type span {
	color: var(--text-tertiary);
}

.amount {
	font-size: 26px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-primary);

	margin-bottom: 12px;
}

.amount span {
	color: var(--text-tertiary);
}

.usd {
	font-size: 14px;
	line-height: 1;
	font-weight: 500;
	color: var(--text-tertiary);
}

.details {
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.detail {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.key,
.value {
	font-size: 14px;
	line-height: 1;
	font-weight: 600;
}

.key {
	display: flex;
	align-items: center;
	gap: 8px;

	fill: var(--text-tertiary);
	color: var(--text-tertiary);
}

.value {
	color: var(--text-secondary);

	cursor: pointer;
}

.subtitle {
	font-size: 14px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-secondary);
}
</style>
