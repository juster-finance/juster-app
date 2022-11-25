<script setup>
import { ref, reactive, onMounted } from "vue"
import { DateTime } from "luxon"

/**
 * UI
 */
import Modal from "@ui/Modal.vue"
import Button from "@ui/Button.vue"
import Block from "@ui/Block.vue"
import Spin from "@ui/Spin.vue"
import Tooltip from "@ui/Tooltip.vue"

/**
 * Store
 */
import { useNotificationsStore } from "@store/notifications"

/**
 * Services
 */
import { rpcNodes } from "@config"
import { currentNetwork } from "@sdk"
import { flags, updateFlag } from "@/services/flags"
import { RpcStatuses } from "@/services/constants"

defineProps({ show: { type: Boolean } })
const emit = defineEmits(["onSelectCustomNode", "onClose"])

const notificationsStore = useNotificationsStore()

const selectedNode = ref({})
const handleSelectNode = (node) => {
	selectedNode.value = node

	customRPC.value = ""
}

const customRPC = ref("")
const handleCustomRPC = () => {
	const url = prompt("Enter RPC base URL:", "https://")
	const urlRegex =
		/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/

	if (!url) return

	if (urlRegex.test(url)) {
		customRPC.value = url

		selectedNode.value = {
			name: "Custom RPC Node",
			url,
		}
	} else {
		notificationsStore.create({
			notification: {
				type: "warning",
				title: "Wrong URL format",
				description: "Remember, the link must start with https",
				autoDestroy: true,
			},
		})
	}
}

const rpcStates = reactive({})
const checkRpcNode = async (rpc) => {
	try {
		const data = await (
			await fetch(`${rpc.url}/chains/main/blocks/head/header`)
		).json()

		if (data.message && !data.level) {
			rpcStates[rpc.code] = {
				status: RpcStatuses.UNAVAILABLE,
				message: data.message,
			}
		} else {
			const isDelayed =
				DateTime.now()
					.diff(DateTime.fromISO(data.timestamp), "second")
					.toObject().seconds > 60

			rpcStates[rpc.code] = {
				status: RpcStatuses.AVAILABLE,
				message: !isDelayed ? "Everything is fine" : "Delayed",
				isDelayed,
			}
		}
	} catch ({ message }) {
		if (message === "Failed to fetch") {
			rpcStates[rpc.code] = {
				status: RpcStatuses.UNAVAILABLE,
				message,
			}
		}
	}
}

onMounted(() => {
	rpcNodes[currentNetwork.value].forEach((node) => {
		rpcStates[node.code] = {
			status: RpcStatuses.LOADING,
			message: "Loading..",
		}

		checkRpcNode(node)
	})
})

const handleContinue = () => {
	emit("onSelectCustomNode", selectedNode)
}

const handleCloseCustomRpcInfo = () => {
	updateFlag("showCustomRpcInfo", false)

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
						updateFlag("showCustomRpcInfo", true)
					},
				},
			],
		},
	})
}
</script>

<template>
	<Modal :show="show" width="650" closable @onClose="$emit('onClose')">
		<div :class="$style.title">Connection with custom RPC</div>

		<div :class="$style.description">
			Select an RPC node from the ready-made list based on the selected
			network
		</div>

		<Block
			v-if="flags.showCustomRpcInfo"
			icon="help"
			color="gray"
			@onClose="handleCloseCustomRpcInfo"
			:class="$style.banner"
		>
			<span>Verify that the RPC node is working properly.</span>
			Selecting and continuing to use a custom RPC can affect the
			functionality of the app.
		</Block>

		<div :class="$style.subtitle">Select RPC</div>

		<div :class="$style.nodes">
			<Flex
				v-for="node in rpcNodes[currentNetwork]"
				:key="node.name"
				@click="handleSelectNode(node)"
				justify="between"
				align="center"
				:class="$style.node"
			>
				<Flex gap="12">
					<div
						:class="[
							$style.radio,
							selectedNode.name == node.name && $style.selected,
						]"
					>
						<div :class="$style.dot" />
					</div>

					<div :class="$style.base">
						<div>{{ node.name }}</div>
						<div>{{ node.url }}</div>
					</div>
				</Flex>

				<Spin
					v-if="rpcStates[node.code].status === RpcStatuses.LOADING"
					size="16"
				/>
				<Tooltip v-else placement="bottom">
					<Icon
						:name="
							([
								RpcStatuses.AVAILABLE,
								RpcStatuses.DELAYED,
							].includes(rpcStates[node.code].status) &&
								'checkcircle') ||
							(rpcStates[node.code].status ===
								RpcStatuses.UNAVAILABLE &&
								'warning')
						"
						size="16"
						:style="{
							fill:
								(rpcStates[node.code].isDelayed &&
									'var(--yellow)') ||
								(rpcStates[node.code].status ===
									RpcStatuses.AVAILABLE &&
									'var(--green)') ||
								(rpcStates[node.code].status ===
									RpcStatuses.UNAVAILABLE &&
									'var(--red)'),
						}"
					/>

					<template #content>{{
						rpcStates[node.code].message
					}}</template>
				</Tooltip>
			</Flex>

			<Flex @click="handleCustomRPC" gap="12" :class="$style.node">
				<div
					:class="[
						$style.radio,
						selectedNode.name == 'Custom RPC Node' &&
							$style.selected,
					]"
				/>

				<div :class="$style.base">
					<div>Custom RPC Node</div>

					<div>
						<Icon name="edit" size="12" />{{
							customRPC ? customRPC : "Enter RPC base URL"
						}}
					</div>
				</div>
			</Flex>
		</div>

		<Button
			@click="handleContinue"
			@onKeybind="handleContinue"
			:type="selectedNode.name ? 'primary' : 'secondary'"
			size="large"
			:disabled="!selectedNode.name"
			block
			keybind="C"
		>
			<Icon name="login" size="16" />Continue to Beacon</Button
		>
	</Modal>
</template>

<style module>
.wrapper {
}

.title {
	font-size: 20px;
	font-weight: 600;
	line-height: 1.2;
	color: var(--text-primary);

	margin-bottom: 16px;
}

.description {
	font-size: 14px;
	line-height: 1.6;
	font-weight: 600;
	color: var(--text-tertiary);

	margin-bottom: 32px;
}

.banner {
	margin-bottom: 32px;
}

.subtitle {
	font-size: 14px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-secondary);

	margin-bottom: 16px;
}

.nodes {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
	grid-gap: 16px;

	margin-bottom: 32px;
}

.node {
	border-radius: 8px;
	background: rgba(255, 255, 255, 0.05);
	cursor: pointer;

	padding: 16px;
}

.radio {
	display: flex;
	align-items: center;
	justify-content: center;

	min-width: 14px;
	height: 14px;
	border-radius: 50%;
	border: 2px solid var(--opacity-10);
	transition: all 0.2s ease;
}

.dot {
	width: 6px;
	height: 6px;
	border-radius: 50%;
	background: var(--blue);
	opacity: 0;
	transition: all 0.2s ease;
}

.radio.selected {
	border: 2px solid var(--blue) !important;
}

.radio.selected .dot {
	opacity: 1;
}

.node:hover .radio {
	border: 2px solid var(--opacity-20);
}

.base {
	display: flex;
	flex-direction: column;
	gap: 8px;

	width: 100%;
}

.base div:nth-child(1) {
	font-size: 14px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-primary);
}

.base div:nth-child(2) {
	display: flex;

	font-size: 12px;
	line-height: 1;
	font-weight: 500;
	color: var(--text-tertiary);
	fill: var(--text-secondary);
	user-select: text;
	cursor: text;
}

.base div:nth-child(2) svg {
	margin-right: 6px;
}
</style>
