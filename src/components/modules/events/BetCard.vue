<script setup>
import { ref, computed } from "vue"
import { DateTime } from "luxon"

/**
 * UI
 */
import Spin from "@ui/Spin.vue"

/**
 * Modals
 */
import OperationModal from "@local/modals/OperationModal.vue"

/**
 * Store
 */
import { useAccountStore } from "@store/account"

/**
 * Services
 */
import { numberWithSymbol } from "@utils/amounts"

const accountStore = useAccountStore()

const props = defineProps({
	bet: { type: Object, default: () => {} },
	event: { type: Object, default: () => {} },
	pending: Boolean,
})

const showOperationModal = ref(false)

const side = computed(() => (props.bet.side == "ABOVE_EQ" ? "Up" : "Down"))

const isWon = computed(() => props.bet.side == props.event?.winnerBets)
</script>

<template>
	<div @click="showOperationModal = true" :class="$style.wrapper">
		<OperationModal
			:show="showOperationModal"
			:data="bet"
			@onClose="showOperationModal = false"
		/>

		<div :class="$style.base">
			<div :class="[$style.icon, isWon && $style.won]">
				<Icon
					v-if="!pending"
					:name="isWon ? 'checkcircle' : 'money'"
					size="16"
				/>

				<Spin v-else size="16" />

				<router-link
					:to="`/profile/${pending ? accountStore.pkh : bet.userId}`"
					:class="$style.user_avatar"
				>
					<img
						:src="`https://services.tzkt.io/v1/avatars/${
							pending ? accountStore.pkh : bet.userId
						}`"
						alt="avatar"
					/>
				</router-link>
			</div>

			<div :class="$style.info">
				<div v-if="!pending" :class="$style.title">
					{{ accountStore.pkh == bet.userId ? "My" : "" }} Stake
				</div>

				<div v-else :class="$style.title">Pending Stake</div>

				<div v-if="!pending" :class="$style.time">
					{{
						DateTime.fromISO(bet.createdTime, {
							locale: "en",
						}).toRelative()
					}}
				</div>

				<div v-else :class="$style.time">Just now</div>
			</div>
		</div>

		<!-- Desktop Template -->
		<div :class="$style.desktop">
			<div
				:class="[$style.param, side == 'Up' ? $style.up : $style.down]"
			>
				<Icon
					:name="
						side === 'Up'
							? 'arrow_circle_top_right'
							: 'arrow_circle_bottom_right'
					"
					size="12"
				/>
				{{ side }}
			</div>

			<div :class="$style.param">
				{{ numberWithSymbol(bet.amount.toFixed(2), ",") }}&nbsp;
				<span>XTZ</span>
			</div>

			<div v-if="event.status == 'CANCELED'" :class="$style.param">
				{{ numberWithSymbol(bet.amount.toFixed(2), ",") }}&nbsp;
				<span>XTZ</span>
			</div>

			<div v-else-if="event.status == 'FINISHED'" :class="$style.param">
				{{
					isWon
						? `+${numberWithSymbol(
								(bet.reward - bet.amount).toFixed(2),
								",",
						  )}`
						: 0
				}}&nbsp;
				<span>XTZ</span>
			</div>

			<div
				v-else-if="['NEW', 'STARTED'].includes(event.status)"
				:class="$style.param"
			>
				{{
					numberWithSymbol((bet.reward - bet.amount).toFixed(2), ",")
				}}&nbsp;
				<span>XTZ</span>
			</div>
		</div>

		<!-- Mobile Template -->
		<div :class="$style.mobile">
			<div
				:class="[$style.param, side == 'Up' ? $style.up : $style.down]"
			>
				<div :class="$style.key">Side</div>

				<div :class="$style.value">
					<Icon
						:name="
							side === 'Up'
								? 'arrow_circle_top_right'
								: 'arrow_circle_bottom_right'
						"
						size="12"
					/>
					{{ side }}
				</div>
			</div>

			<div :class="$style.param">
				<div :class="$style.key">Amount</div>

				<div :class="$style.value">
					{{ numberWithSymbol(bet.amount.toFixed(2), ",") }}&nbsp;
					<span>XTZ</span>
				</div>
			</div>

			<div v-if="event.status == 'CANCELED'" :class="$style.param">
				<div :class="$style.key">Amount</div>

				<div :class="$style.value">
					{{ numberWithSymbol(bet.amount.toFixed(2), ",") }}&nbsp;
					<span>XTZ</span>
				</div>
			</div>

			<div v-else-if="event.status == 'FINISHED'" :class="$style.param">
				<div :class="$style.key">Amount</div>

				<div :class="$style.value">
					{{
						isWon
							? `+${numberWithSymbol(
									(bet.reward - bet.amount).toFixed(2),
									",",
							  )}`
							: 0
					}}&nbsp;
					<span>XTZ</span>
				</div>
			</div>

			<div
				v-else-if="['NEW', 'STARTED'].includes(event.status)"
				:class="$style.param"
			>
				<div :class="$style.key">Amount</div>

				<div :class="$style.value">
					{{
						numberWithSymbol(
							(bet.reward - bet.amount).toFixed(2),
							",",
						)
					}}&nbsp;
					<span>XTZ</span>
				</div>
			</div>
		</div>
	</div>
</template>

<style module>
.wrapper {
	display: flex;
	align-items: center;

	height: 60px;
	border-radius: 8px;
	background: var(--card-bg);
	outline: 2px solid transparent;
	padding: 0 16px;
	cursor: pointer;

	transition: all 0.2s ease;
}

.wrapper:hover {
	outline: 2px solid var(--border);
}

.base {
	display: flex;
	align-items: center;
	flex: 2;
}

.icon {
	position: relative;

	display: flex;
	align-items: center;
	justify-content: center;

	width: 32px;
	height: 32px;
	border-radius: 8px;
	background: var(--opacity-05);
	fill: var(--icon);

	margin-right: 16px;
}

.icon.won {
	fill: var(--green);
}

.user_avatar img {
	position: absolute;
	top: -8px;
	right: -8px;

	width: 20px;
	height: 20px;
	background: var(--card-bg);
	border-radius: 50%;
}

.info {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.title {
	font-size: 14px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-primary);
}

.time {
	font-size: 12px;
	line-height: 1;
	font-weight: 500;
	color: var(--text-tertiary);
}

.param {
	display: flex;
	align-items: center;

	font-size: 14px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-primary);

	flex: 1;
}

.param.up {
	fill: var(--green);
}

.param.down {
	fill: var(--red);
}

.param svg {
	margin-right: 6px;
}

.param span {
	color: var(--text-tertiary);
}

.desktop {
	display: flex;
	align-items: center;
	flex: 3;
}

.mobile {
	display: none;

	flex-direction: column;
	gap: 20px;

	width: 100%;
}

.key {
	color: var(--text-tertiary);
}

.value {
	display: flex;
	align-items: center;
}

@media (max-width: 650px) {
	.wrapper {
		align-items: flex-start;
		flex-direction: column;

		padding: 16px;
		height: initial;
	}

	.desktop {
		display: none;
	}

	.mobile {
		display: flex;
	}

	.base {
		margin-bottom: 24px;
	}

	.param {
		justify-content: space-between;
	}
}
</style>
