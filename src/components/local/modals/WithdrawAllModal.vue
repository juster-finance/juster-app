<script>
/**
 * Vendor
 */
import { computed, defineComponent, ref, toRefs, watch } from "vue"

/**
 * UI
 */
import Modal from "@ui/Modal.vue"
import Button from "@ui/Button.vue"
import LoadingBar from "@ui/LoadingBar.vue"
import Checkbox from "@ui/Checkbox.vue"

/**
 * Store
 */
import { useNotificationsStore } from "@store/notifications"
import { useAccountStore } from "@store/account"

/**
 * SDK
 */
import { withdrawAll } from "@sdk"

/**
 * Services
 */
import { supportedMarkets } from "@config"
import { numberWithSymbol } from "@utils/amounts"

export default defineComponent({
	name: "WithdrawAllModal",
	props: { show: Boolean },

	setup(props, context) {
		const { show } = toRefs(props)

		const accountStore = useAccountStore()
		const notificationsStore = useNotificationsStore()

		const awaitingConfirmation = ref(false)

		const positions = computed(() => accountStore.positionsForWithdrawal)

		const selectedPositionsIds = ref([])
		const selectedPositions = computed(() =>
			positions.value.filter((position) =>
				selectedPositionsIds.value.includes(position.id),
			),
		)

		const isAllSelected = computed(() =>
			positions.value.every((position) =>
				selectedPositionsIds.value.includes(position.id),
			),
		)

		const buttonState = computed(() => {
			if (!selectedPositionsIds.value.length)
				return {
					text: "Select at least one position",
					disabled: true,
				}

			if (awaitingConfirmation.value)
				return {
					text: "",
					disabled: true,
				}

			return {
				text: `Withdraw ${numberWithSymbol(
					selectedPositions.value.reduce(
						(acc, curr) => acc + curr.value,
						0,
					),
					",",
				)} ꜩ`,
				disabled: false,
			}
		})

		const handleSelectPosition = (position) => {
			if (selectedPositionsIds.value.includes(position.id)) {
				selectedPositionsIds.value.splice(
					selectedPositionsIds.value.indexOf(position.id),
					1,
				)
			} else {
				selectedPositionsIds.value.push(position.id)
			}
		}

		const handleSelectAllPositions = () => {
			positions.value.forEach((position) => {
				selectedPositionsIds.value.push(position.id)
			})
		}
		const handleUnselectAllPositions = () => {
			selectedPositionsIds.value = []
		}

		const handleWithdrawAll = async () => {
			if (!selectedPositionsIds.value.length) return

			const selectedEventsIds = positions.value
				.filter((pos) => selectedPositionsIds.value.includes(pos.id))
				.map((pos) => pos.event.id)

			awaitingConfirmation.value = true

			const result = await withdrawAll({
				eventIds: selectedEventsIds,
				address: accountStore.pkh,
			})

			if (result.success) {
				context.emit("onClose")
				awaitingConfirmation.value = false

				notificationsStore.create({
					notification: {
						type: "success",
						title: "Batch request sent",
						description: `Wait for confirmation of the operation to continue (${result.op})`,
						autoDestroy: true,
					},
				})
			} else {
				awaitingConfirmation.value = false

				notificationsStore.create({
					notification: {
						type: "warning",
						title: result.title,
						description: result.message,
						autoDestroy: true,
					},
				})
			}
		}

		const getSideIcon = (side) => {
			return new URL(
				`../../../assets/icons/${side}_won.svg`,
				import.meta.url,
			).href
		}

		watch(show, () => {
			if (!show.value) {
				selectedPositionsIds.value = []
				awaitingConfirmation.value = false
			}
		})

		return {
			positions,
			supportedMarkets,
			selectedPositionsIds,
			selectedPositions,
			isAllSelected,
			awaitingConfirmation,
			getSideIcon,
			handleSelectPosition,
			handleSelectAllPositions,
			handleUnselectAllPositions,
			handleWithdrawAll,
			buttonState,
		}
	},

	components: {
		Modal,
		Button,
		LoadingBar,
		Checkbox,
	},
})
</script>

<template>
	<Modal :show="show" width="500" new closable @onClose="$emit('onClose')">
		<Flex align="center" justify="between" :class="$style.head">
			<Flex align="center" gap="8">
				<Icon name="coins" size="16" color="secondary" />

				<Text
					size="14"
					weight="600"
					color="primary"
					:class="$style.head_btn"
				>
					Withdraw all
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
			<Text size="13" weight="500" color="tertiary" height="16">
				Send a batch request to withdraw all your funds
			</Text>

			<Flex direction="column" gap="16">
				<div :class="$style.subtitle">
					<span>Select positions to withdraw</span>

					<span
						v-if="!isAllSelected"
						@click="handleSelectAllPositions"
						>Select all ({{
							positions.filter((pos) => pos.value).length
						}})</span
					>
					<span v-else @click="handleUnselectAllPositions"
						>Unselect all ({{
							positions.filter((pos) => pos.value).length
						}})</span
					>
				</div>

				<div v-if="positions.length" :class="$style.positions">
					<div
						v-for="position in positions.filter((pos) => pos.value)"
						:key="position.id"
						@click="handleSelectPosition(position)"
						:class="$style.position"
					>
						<Checkbox
							:forceChecked="
								selectedPositionsIds.includes(position.id)
							"
						/>

						<Flex direction="column" gap="8">
							<div :class="$style.name">
								<Icon
									v-if="
										position.event.winnerBets == 'ABOVE_EQ'
									"
									name="higher"
									size="16"
									color="green"
								/>
								<Icon
									v-else
									name="lower"
									size="16"
									color="tertiary"
								/>

								<span>{{
									supportedMarkets[
										position.event.currencyPair.symbol
									].description
								}}</span>

								price event
							</div>
							<div :class="$style.subname">
								Event: #{{ position.event.id }},
								amount:&nbsp;<span>{{
									position.value.toFixed(2)
								}}</span
								>&nbsp;ꜩ
							</div>
						</Flex>
					</div>
				</div>
			</Flex>

			<Button
				@click="handleWithdrawAll"
				:type="buttonState.disabled ? 'secondary' : 'success'"
				size="large"
				:disabled="buttonState.disabled"
				:loading="awaitingConfirmation"
				block
			>
				<Icon
					v-if="!awaitingConfirmation && !buttonState.disabled"
					name="coins"
					size="16"
				/>
				<LoadingBar v-else-if="awaitingConfirmation" size="16" />
				{{ buttonState.text }}
			</Button>
		</Flex>
	</Modal>
</template>

<style module>
.wrapper {
}

.head {
	height: 56px;

	padding: 0 20px;
}

.base {
	padding: 0px 20px 20px 20px;
}

.close_icon {
	cursor: pointer;
}

.subtitle {
	display: flex;
	justify-content: space-between;

	font-size: 14px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-secondary);
}

.subtitle span:nth-child(2) {
	color: var(--text-blue);
	cursor: pointer;
}

.positions {
	display: flex;
	flex-direction: column;
	gap: 8px;

	max-height: 340px;
	overflow-y: auto;
}

.position {
	display: flex;
	gap: 14px;

	cursor: pointer;
	border-radius: 8px;
	background: rgba(255, 255, 255, 0.05);
	padding: 16px;
}

.name {
	display: flex;
	align-items: center;
	gap: 6px;

	font-size: 14px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-tertiary);
}

.name img {
	width: 16px;
	height: 16px;
}

.name span {
	color: var(--text-primary);
}

.subname {
	display: flex;

	font-size: 12px;
	line-height: 1;
	font-weight: 500;
	color: var(--text-tertiary);
}

.subname span {
	color: var(--text-primary);
}
</style>
