<script setup>
/**
 * Vendor
 */
import { ref, watch, nextTick } from "vue"
import qrcode from "qrcode"

/**
 * UI
 */
import Modal from "@ui/Modal.vue"
import Button from "@ui/Button.vue"

/**
 * Services
 */
import { toClipboard, shorten } from "@utils/misc"
import { currentNetwork } from "@sdk"

/**
 * Store
 */
import { useNotificationsStore } from "@store/notifications"

const notificationsStore = useNotificationsStore()

const props = defineProps({
	show: Boolean,
	pool: Object,
})

const emit = defineEmits(["onClose"])

const handleCopy = () => {
	notificationsStore.create({
		notification: {
			icon: "copy",
			title: "Contract address copied to clipboard",
			autoDestroy: true,

			badges: [
				{
					icon: "user",
					secondaryText: `${
						currentNetwork === "mainnet" ? "" : "ghostnet."
					}tzkt.io/${shorten(props.pool.address, 4, 4)}`,
				},
			],
		},
	})
	toClipboard(
		`https://${currentNetwork === "mainnet" ? "" : "ghostnet."}tzkt.io/${
			props.pool.address
		}`,
	)
}

const canvasEl = ref(null)

watch(
	() => props.show,
	() => {
		if (props.show) {
			nextTick(() => {
				qrcode.toCanvas(
					canvasEl.value,
					`https://${
						currentNetwork === "mainnet" ? "" : "ghostnet."
					}tzkt.io/${props.pool.address}`,
					{
						width: 200,
						color: { light: "#0000", dark: "#F0F0F0" },
					},
					function (error) {
						if (error) console.error(error)

						const logo = new Image()
						logo.src = new URL(
							`@/assets/tzkt.svg`,
							import.meta.url,
						).href
						logo.onload = () => {
							const ctx = canvasEl.value.getContext("2d")
							ctx.imageSmoothingEnabled = false
							ctx.drawImage(logo, 75, 75, 50, 50)
						}
					},
				)
			})
		}
	},
)
</script>

<template>
	<Modal
		new
		:show="show"
		width="450"
		closable
		disable-trap
		@onClose="emit('onClose')"
	>
		<Flex align="center" justify="between" :class="$style.head">
			<Flex align="center" gap="8">
				<Icon name="share" size="16" color="secondary" />

				<Text
					@click="emit('onBack')"
					size="14"
					weight="600"
					color="primary"
					:class="$style.head_btn"
				>
					Share Pool
				</Text>
			</Flex>

			<Icon
				@click="emit('onClose')"
				name="close"
				size="16"
				color="tertiary"
				:class="$style.close_icon"
			/>
		</Flex>

		<Flex direction="column" align="center" gap="32" :class="$style.base">
			<Text size="13" weight="500" color="tertiary" height="16">
				Use the QR code below to quickly open in a mobile browser either
				the button below to view in a new tab
			</Text>

			<canvas ref="canvasEl" />

			<Flex direction="column" gap="16" wide>
				<div :class="$style.divider" />

				<Flex direction="column" gap="8">
					<Button
						type="secondary"
						size="small"
						:link="`https://${
							currentNetwork === 'mainnet' ? '' : 'ghostnet.'
						}tzkt.io/${props.pool.address}`"
						block
					>
						<Icon name="arrowrighttop" size="12" color="tertiary" />
						View contract on TzKT
					</Button>
					<Button
						@click="handleCopy"
						type="secondary"
						size="small"
						block
					>
						<Icon name="copy" size="12" /> Copy contract address
					</Button>
				</Flex>
			</Flex>
		</Flex>
	</Modal>
</template>

<style module>
.head {
	height: 56px;

	padding: 0 20px;
}

.head_btn {
	cursor: pointer;
}

.close_icon {
	cursor: pointer;
}

.base {
	padding: 0px 20px 20px 20px;
}

.divider {
	width: 100%;
	height: 1px;
	background: var(--border);
}
</style>
