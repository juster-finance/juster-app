<script setup>
import { ref } from "vue"

/**
 * UI
 */
import Modal from "@/components/ui/Modal"
import Button from "@/components/ui/Button"
import Banner from "@/components/ui/Banner"

/**
 * Store
 */
import { useNotificationsStore } from "@/store/notifications"

/**
 * Services
 */
import { rpcNodes } from "@/services/config"
import { currentNetwork } from "@/services/sdk"

defineProps({ show: { type: Boolean } })
const emit = defineEmits(["onSelectCustomNode"])

const notificationsStore = useNotificationsStore()

const selectedNode = ref({})
const handleSelectNode = (node) => {
	selectedNode.value = node

	customRPC.value = ""
}

const customRPC = ref("")
const handleCustomRPC = () => {
	const url = prompt("Enter RPC base URL (Start with `https://`):")
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
				description: "Please note that the link must start with https",
				autoDestroy: true,
			},
		})
	}
}

const handleContinue = () => {
	emit("onSelectCustomNode", selectedNode)
}
</script>

<template>
	<Modal :show="show" width="650" closable @onClose="$emit('onClose')">
		<div :class="$style.title">Connection with custom RPC</div>

		<div :class="$style.description">
			Select an RPC node from the ready-made list based on the selected
			network
		</div>

		<div :class="$style.subtitle">Select RPC</div>

		<div :class="$style.nodes">
			<div
				v-for="node in rpcNodes[currentNetwork]"
				:key="node.name"
				@click="handleSelectNode(node)"
				:class="$style.node"
			>
				<div
					:class="[
						$style.radio,
						selectedNode.name == node.name && $style.selected,
					]"
				/>

				<div :class="$style.base">
					<div>{{ node.name }}</div>
					<div>{{ node.url }}</div>
				</div>
			</div>

			<div @click="handleCustomRPC" :class="$style.node">
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
			</div>
		</div>

		<Banner color="gray" :class="$style.banner">
			Selecting and continuing to use a custom RPC can affect the
			operation of the application.
		</Banner>

		<Button
			@click="handleContinue"
			:type="selectedNode.name ? 'primary' : 'secondary'"
			size="large"
			:disabled="!selectedNode.name"
			block
		>
			<Icon name="beacon" size="16" />Continue to Beacon</Button
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
	display: flex;
	gap: 14px;

	border-radius: 8px;
	border: 1px solid var(--border);
	background: rgba(255, 255, 255, 0.05);
	cursor: pointer;

	padding: 16px;

	transition: border 0.2s ease;
}

.node:hover {
	border: 1px solid var(--border-highlight);
}

.radio {
	min-width: 14px;
	height: 14px;
	border-radius: 50%;
	border: 2px solid var(--opacity-10);
	transition: all 0.2s ease;
}

.radio.selected {
	border: 2px solid var(--blue) !important;
}

.node:hover .radio {
	border: 2px solid var(--opacity-20);
}

.base {
	display: flex;
	flex-direction: column;
	gap: 8px;
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
}

.base div:nth-child(2) svg {
	margin-right: 6px;
}
</style>
