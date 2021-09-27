<script>
import { defineComponent, ref, reactive, toRefs } from "vue"

export default defineComponent({
    name: "SlippageSelector",
    props: {
        modelValue: Number,
    },

    setup(props, context) {
        const { modelValue: selectedSlippage } = toRefs(props)

        const slippages = reactive([0.0, 2.5, 5.0, 10.0, 15.0])
        const customSlippage = ref(0)

        const handleInput = e => {
            if (customSlippage.value > 30) {
                customSlippage.value = 30
                context.emit("update:modelValue", customSlippage.value)
            } else if (!customSlippage.value) {
                context.emit("update:modelValue", 0)
            } else {
                context.emit("update:modelValue", customSlippage.value)
            }
        }

        const selectSlippage = target => {
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
    height: 44px;
    padding: 0 14px;
}

.slippage {
    display: flex;
    align-items: center;

    font-size: 14px;
    line-height: 1.4;
    font-weight: 500;
    color: var(--text-tertiary);

    border-right: 1px solid var(--border);
    padding: 0 16px;

    cursor: pointer;

    transition: color 0.2s ease;
}

.slippage.selected {
    color: var(--text-primary);
}

.slippage:first-child {
    padding: 0 16px 0 0;
}

.slippage:last-child {
    border-right: none;
    padding: 0 0 0 16px;
}

.custom {
    display: flex;
    align-items: center;

    border-radius: 8px;
    border: 1px solid var(--border);
    height: 44px;
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
