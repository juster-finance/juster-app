<script>
import { defineComponent, ref, reactive, toRefs } from "vue"

export default defineComponent({
	name: "SlippageSelector",
	props: {
		modelValue: Number,
	},

	setup(props, context) {
		const { modelValue: selectedSlippage } = toRefs(props)

		const slippages = reactive([0.0, 2.5, 5.0])
		const customSlippage = ref(0)

		const handleInput = (e) => {
			if (customSlippage.value > 30) {
				customSlippage.value = 30
				context.emit("update:modelValue", customSlippage.value)
			} else if (!customSlippage.value) {
				context.emit("update:modelValue", 0)
			} else {
				context.emit("update:modelValue", customSlippage.value)
			}
		}

		const selectSlippage = (target) => {
			customSlippage.value = 0

			context.emit("update:modelValue", target)
		}

		return {
			slippages,
			customSlippage,
			selectedSlippage,
			handleInput,
			selectSlippage,
		}
	},
})
</script>

<template>
	<div :class="$style.wrapper">
		<div :class="$style.title">Slippage tolerance</div>

		<div :class="$style.base">
			<div :class="$style.slippages">
				<div
					v-for="slippage in slippages"
					:key="slippage"
					@click="selectSlippage(slippage)"
					:class="[
						$style.slippage,
						selectedSlippage == slippage && $style.selected,
					]"
				>
					{{ slippage.toFixed(1) }}%
				</div>
			</div>

			<div :class="$style.custom">
				<input
					type="number"
					v-model="customSlippage"
					placeholder="E.g. 5"
					@input="handleInput"
					@keydown="$event.key == '-' && $event.preventDefault()"
				/>

				<span>%</span>
			</div>
		</div>
	</div>
</template>

<style module>
.wrapper {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.title {
	font-size: 12px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-primary);
}

.base {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.slippages {
	display: flex;
	align-items: center;

	border-radius: 8px;
	border: 1px solid var(--border);
	height: 36px;
	padding: 0 4px;
	background: rgba(255, 255, 255, 0.02);
}

.slippage {
	display: flex;
	align-items: center;

	font-size: 14px;
	font-weight: 600;
	line-height: 1.1;
	color: var(--text-tertiary);
	height: 28px;
	border-radius: 6px;

	padding: 0 14px;

	cursor: pointer;

	transition: color 0.2s ease;
}

.slippage.selected {
	background: rgba(255, 255, 255, 0.1);
	color: var(--text-primary);
}

.custom {
	display: flex;
	align-items: center;

	border-radius: 8px;
	border: 1px solid var(--border);
	height: 36px;
	padding: 0 14px;
}

.custom input {
	width: 44px;
	text-align: right;

	font-size: 14px;
	line-height: 1.4;
	font-weight: 500;
	color: var(--text-primary);
}

.custom span {
	font-size: 14px;
	line-height: 1.4;
	font-weight: 500;
	color: var(--text-primary);
}

.custom input::-webkit-outer-spin-button,
.custom input::-webkit-inner-spin-button {
	-webkit-appearance: none;
	margin: 0;
}
</style>
