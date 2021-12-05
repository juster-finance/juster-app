<script>
import { defineComponent, reactive, ref, toRefs, watch, inject } from "vue"

/**
 * UI
 */
import Button from "@/components/ui/Button"
import Checkbox from "@/components/ui/Checkbox"

export default defineComponent({
    name: "EventsFilters",
    props: {
        filters: Object,
        liquidityRange: Object,
        liquidityFilters: Object,
        events: Array,
    },

    setup(props, context) {
        const amplitude = inject("amplitude")

        const { liquidityRange, liquidityFilters } = toRefs(props)

        const values = reactive({
            min: 0,
            max: 0,
        })

        const position = reactive({
            left: 0,
            right: 0,
        })

        const inputs = reactive({
            min: 0,
            max: 0,
        })

        const minInputEl = ref(null)
        const maxInputEl = ref(null)

        const handleReset = () => {
            amplitude.logEvent("onResetFilters")

            context.emit("onReset")
        }

        /** watch for reset */
        watch(liquidityFilters.value, () => {
            inputs.min = liquidityFilters.value.min
            inputs.max = liquidityFilters.value.max
        })

        watch(liquidityRange.value, () => {
            if (typeof liquidityRange.value.min == "number") {
                values.min = liquidityRange.value.min
                values.max = liquidityRange.value.max

                inputs.min = liquidityRange.value.min
                inputs.max = liquidityRange.value.max
            }
        })

        watch(
            () => inputs.min,
            () => {
                context.emit("onNewMin", inputs.min)

                if (liquidityRange.value.min == inputs.min) {
                    position.left = 0
                    return
                }
                if (liquidityRange.value.max < inputs.min) {
                    inputs.min = liquidityRange.value.min
                    return
                }

                const left =
                    ((inputs.min - liquidityRange.value.min) * 100) /
                    (liquidityRange.value.max - liquidityRange.value.min)

                position.left = left > 0 ? left : 0
            },
        )

        watch(
            () => inputs.max,
            () => {
                context.emit("onNewMax", inputs.max)

                if (liquidityRange.value.max == inputs.max) {
                    position.right = 0
                    return
                }
                if (liquidityRange.value.max < inputs.max) {
                    inputs.max = liquidityRange.value.max
                    return
                }

                const right =
                    ((liquidityRange.value.max - inputs.max) * 100) /
                    (liquidityRange.value.max - liquidityRange.value.min)

                position.right = right > 0 ? right : 0
            },
        )

        const handleBlur = (target) => {
            if (target == "min") {
                if (inputs.min < liquidityRange.value.min) {
                    inputs.min = liquidityRange.value.min
                }
            }

            if (target == "max") {
                if (inputs.max > liquidityRange.value.max) {
                    inputs.max = liquidityRange.value.max
                }
            }

            if (inputs.min > liquidityRange.value.max) {
                inputs.min = liquidityRange.value.max
            }

            if (inputs.max < liquidityRange.value.min) {
                inputs.max = liquidityRange.value.min
            }
        }

        const handleKeydown = (e) => {
            if (e.key === "-") e.preventDefault()
        }

        return {
            handleKeydown,
            handleBlur,
            values,
            position,
            inputs,
            minInputEl,
            maxInputEl,
            handleReset,
        }
    },

    components: { Button, Checkbox },
})
</script>

<template>
    <div :class="$style.wrapper">
        <div :class="$style.title">Filters</div>

        <div :class="$style.block">
            <div :class="$style.subtitle">Symbol</div>

            <div :class="$style.symbols">
                <Checkbox v-model="filters.symbols.xtz"
                    ><div :class="$style.symbol_checkbox">
                        XTZ-USD
                        <span>{{
                            events.filter(
                                (event) =>
                                    event.currencyPair.symbol == "XTZ-USD",
                            ).length
                        }}</span>
                    </div></Checkbox
                >
                <Checkbox v-model="filters.symbols.btc"
                    ><div :class="$style.symbol_checkbox">
                        BTC-USD
                        <span>{{
                            events.filter(
                                (event) =>
                                    event.currencyPair.symbol == "BTC-USD",
                            ).length
                        }}</span>
                    </div></Checkbox
                >
                <Checkbox v-model="filters.symbols.eth"
                    ><div :class="$style.symbol_checkbox">
                        ETH-USD
                        <span>{{
                            events.filter(
                                (event) =>
                                    event.currencyPair.symbol == "ETH-USD",
                            ).length
                        }}</span>
                    </div></Checkbox
                >
            </div>
        </div>

        <div :class="$style.block">
            <div :class="$style.subtitle">Liquidity</div>

            <div :class="$style.range_picker">
                <div :class="$style.range">
                    <div
                        :class="$style.filled_range"
                        :style="{
                            left: `${position.left}%`,
                            right: `${position.right}%`,
                        }"
                    />
                </div>

                <div :class="$style.range_inputs">
                    <div
                        @click="minInputEl.focus()"
                        :class="$style.range_input"
                    >
                        <Icon name="download" size="12" />
                        <input
                            ref="minInputEl"
                            v-model="inputs.min"
                            type="number"
                            step="200"
                            @keydown="handleKeydown"
                            @blur="handleBlur('min')"
                            placeholder="0"
                        />
                        <span>XTZ</span>
                    </div>

                    <div
                        @click="maxInputEl.focus()"
                        :class="$style.range_input"
                    >
                        <span>XTZ</span>
                        <input
                            ref="maxInputEl"
                            v-model="inputs.max"
                            type="number"
                            step="200"
                            @keydown="handleKeydown"
                            @blur="handleBlur('max')"
                            placeholder="0"
                            :class="$style.right"
                        />
                        <Icon
                            name="download"
                            size="12"
                            :class="$style.reverse"
                        />
                    </div>
                </div>
            </div>
        </div>

        <div :class="$style.block">
            <div :class="$style.subtitle">Status</div>

            <div :class="$style.badges">
                <div
                    v-for="(status, index) in filters.statuses"
                    :key="index"
                    @click="$emit('onSelectStatus', status)"
                    :class="[
                        $style.badge,
                        $style[status.color],
                        status.active && $style.active,
                    ]"
                >
                    <Icon :name="status.icon" size="14" />{{ status.name }}
                </div>
            </div>
        </div>

        <div :class="$style.block">
            <div :class="$style.subtitle">Period</div>

            <div :class="$style.badges">
                <div
                    v-for="(period, index) in filters.periods"
                    :key="index"
                    @click="$emit('onSelectPeriod', period)"
                    :class="[
                        $style.badge,
                        $style.yellow,
                        period.active && $style.active,
                    ]"
                >
                    <Icon name="time" size="14" />{{ period.name }}
                </div>
            </div>
        </div>

        <div :class="$style.block">
            <div :class="$style.subtitle">Target dynamics</div>

            <div :class="$style.badges">
                <div :class="$style.badge">0%</div>
                <div :class="[$style.badge, $style.green]">
                    <Icon name="higher" size="14" />1%
                </div>
                <div :class="[$style.badge, $style.red]">
                    <Icon name="lower" size="14" />1%
                </div>
            </div>
        </div>

        <div :class="$style.divider" />

        <div :class="$style.actions">
            <Button @click="handleReset" type="tertiary" size="small"
                >Reset filters</Button
            >
        </div>
    </div>
</template>

<style module>
.wrapper {
    position: sticky;
    top: 100px;

    background: var(--card-bg);
    border-radius: 8px;
    border: 1px solid var(--border);
    padding: 20px 0;
    height: fit-content;
}

.title {
    font-size: 14px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-primary);

    padding: 0 20px;
    margin-bottom: 24px;
}

.block {
    display: flex;
    flex-direction: column;
    gap: 12px;

    padding: 0 20px;
    margin-bottom: 32px;
}

.subtitle {
    font-size: 12px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-tertiary);
}

.hint {
    font-size: 12px;
    line-height: 1.6;
    font-weight: 500;
    color: var(--text-tertiary);

    padding: 0 20px;
    margin-bottom: 12px;
}

.divider {
    width: 100%;
    height: 1px;
    background: var(--border);

    margin: 20px 0 16px;
}

.actions {
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 0 20px;
}

.symbols {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.symbol_checkbox {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.symbol_checkbox span {
    color: var(--text-tertiary);
}

.badges {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
}

.badge {
    display: flex;
    align-items: center;
    gap: 8px;

    height: 32px;
    border: 1px solid var(--border);
    padding: 0 12px;
    border-radius: 50px;
    cursor: pointer;
    opacity: 0.5;

    font-size: 14px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-primary);

    transition: all 0.2s ease;
}

.badge:hover {
    border: 1px solid var(--border-highlight);
}

.badge.active {
    opacity: 1;
}

.badge.yellow svg {
    fill: var(--yellow);
}

.badge.green svg {
    fill: var(--green);
}

.badge.red svg {
    fill: var(--red);
}

.badge.gray svg {
    fill: var(--text-secondary);
}

.range_picker {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.range {
    position: relative;

    width: 100%;
    height: 4px;
    border-radius: 50px;
    background: var(--opacity-10);
}

.filled_range {
    position: absolute;

    height: 100%;
    background: var(--blue);
    border-radius: 50px;

    transition: all 0.2s ease;
}

.range_inputs {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.range_input {
    display: flex;
    align-items: center;

    cursor: text;

    height: 28px;
    border-radius: 6px;
    border: 1px solid var(--border);
    padding: 0 8px;
}

.range_input svg {
    fill: var(--text-tertiary);

    margin: 0 8px 0 0;
}

.range_input svg.reverse {
    fill: var(--text-tertiary);

    margin: 0 0 0 8px;

    transform: rotate(180deg);
}

.range_input input {
    width: 60px;

    font-size: 13px;
    line-height: 1.1;
    font-weight: 600;
    color: var(--text-primary);

    margin: 0 4px 0 0;
}

.range_input input.right {
    text-align: right;

    margin: 0 0 0 4px;
}

.range_input {
    font-size: 11px;
    line-height: 1.1;
    font-weight: 500;
    color: var(--text-tertiary);
}

.range_input input::-webkit-outer-spin-button,
.range_input input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
</style>
