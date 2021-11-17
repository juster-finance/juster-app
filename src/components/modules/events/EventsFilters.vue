<script>
import { defineComponent } from "vue"

/**
 * UI
 */
import Button from "@/components/ui/Button"
import Checkbox from "@/components/ui/Checkbox"

export default defineComponent({
    name: "EventsFilters",
    props: { filters: Object, events: Array },

    setup() {},

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
                                event => event.currencyPair.symbol == "XTZ-USD",
                            ).length
                        }}</span>
                    </div></Checkbox
                >
                <Checkbox v-model="filters.symbols.btc"
                    ><div :class="$style.symbol_checkbox">
                        BTC-USD
                        <span>{{
                            events.filter(
                                event => event.currencyPair.symbol == "BTC-USD",
                            ).length
                        }}</span>
                    </div></Checkbox
                >
                <Checkbox v-model="filters.symbols.eth"
                    ><div :class="$style.symbol_checkbox">
                        ETH-USD
                        <span>{{
                            events.filter(
                                event => event.currencyPair.symbol == "ETH-USD",
                            ).length
                        }}</span>
                    </div></Checkbox
                >
            </div>
        </div>

        <div :class="$style.block">
            <div :class="$style.subtitle">Liquidity Provided</div>

            <div :class="$style.range_picker">
                <div :class="$style.range">
                    <div :class="$style.slider" />
                    <div :class="$style.slider" />
                </div>

                <div :class="$style.range_values">
                    <div :class="$style.range_value">1 <span>XTZ</span></div>
                    <div :class="$style.range_value">50 <span>XTZ</span></div>
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
                <div :class="$style.badge">
                    0%
                </div>
                <div :class="[$style.badge, $style.green]">
                    <Icon name="higher" size="14" />1%
                </div>
                <div :class="[$style.badge, $style.red]">
                    <Icon name="lower" size="14" />1%
                </div>
            </div>
        </div>

        <div :class="$style.hint">
            Filters are saved for this device. You can customize this behavior
            in the settings.
        </div>

        <div :class="$style.divider" />

        <div :class="$style.actions">
            <Button @click="$emit('onReset')" type="tertiary" size="small"
                >Reset</Button
            >

            <Button type="tertiary" size="small" disabled
                ><Icon name="collection" size="16" />Select Saved preset</Button
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
    gap: 14px;
}

.range {
    position: relative;

    width: 100%;
    height: 4px;
    border-radius: 50px;
    background: var(--opacity-10);
}

.range_values {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.range_value {
    font-size: 13px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-primary);
}

.range_value span {
    color: var(--text-tertiary);
}

.slider {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);

    width: 8px;
    height: 8px;
    outline: 2px solid #fff;
    cursor: pointer;
    border-radius: 50%;
    background: var(--blue);
}

.slider:last-child {
    right: 0;
}
</style>
