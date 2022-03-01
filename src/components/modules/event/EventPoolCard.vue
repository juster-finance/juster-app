<script setup>
import { computed } from "vue"

/**
 * UI
 */
import Button from "@/components/ui/Button"

/**
 * Local
 */
import Pool from "@/components/local/Pool"

/**
 * Services
 */
import { numberWithSymbol } from "@/services/utils/amounts"

const props = defineProps({ event: { type: Object } })
const emit = defineEmits(["onLiquidity"])

const risePool = computed(() =>
    props.event.bets
        .filter((bet) => bet.side == "ABOVE_EQ")
        .reduce((acc, { amount }) => acc + amount, 0),
)
const fallPool = computed(() =>
    props.event.bets
        .filter((bet) => bet.side == "BELOW")
        .reduce((acc, { amount }) => acc + amount, 0),
)

const liquidityLevel = computed(() => {
    if (props.event.totalLiquidityProvided >= 7000)
        return { text: "Ultra", icon: "liquidity_ultra" }
    if (props.event.totalLiquidityProvided >= 3000)
        return { text: "High", icon: "liquidity_high" }
    if (props.event.totalLiquidityProvided >= 1000)
        return { text: "Medium", icon: "liquidity_medium" }
    if (props.event.totalLiquidityProvided < 1000)
        return { text: "Low", icon: "liquidity_low" }
})
</script>

<template>
    <div :class="$style.wrapper">
        <div :class="$style.title">Liquidity</div>

        <Pool :event="event" />

        <Button
            @click="emit('onLiquidity')"
            type="secondary"
            size="small"
            block
            :disabled="
                event.status !== 'NEW' || event.totalLiquidityProvided == 0
            "
            :class="$style.liquidity_btn"
            ><Icon name="liquidity" size="12" />Add Liquidity</Button
        >

        <div :class="$style.params">
            <div :class="$style.param">
                <span><Icon :name="liquidityLevel.icon" size="12" />Level</span>

                <span>{{ liquidityLevel.text }}</span>
            </div>

            <div :class="$style.param">
                <span><Icon name="liquidity" size="12" />Provided</span>

                <span
                    >{{ numberWithSymbol(event.totalLiquidityProvided, ",") }}
                    <span>ꜩ</span></span
                >
            </div>

            <div :class="$style.param">
                <span><Icon name="bolt" size="12" />Fee Percent</span>

                <span>{{ parseInt(event.liquidityPercent * 100) }}% </span>
            </div>
        </div>
    </div>
</template>

<style module>
.wrapper {
    border-radius: 8px;
    border: 1px solid var(--border);
    padding: 20px;
    background: var(--card-bg);
}

.title {
    font-size: 14px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-primary);

    margin-bottom: 20px;
}

.liquidity_btn {
    margin-top: 16px;
}

/* Params */
.params {
    display: flex;
    flex-direction: column;
    gap: 20px;

    margin-top: 32px;
}

.param {
    display: flex;
    justify-content: space-between;

    font-size: 14px;
    line-height: 1;
    font-weight: 600;
}

.param span:nth-child(1) {
    color: var(--text-tertiary);

    display: flex;
    align-items: center;
    gap: 6px;
    fill: var(--opacity-40);
}

.param span:nth-child(2) {
    display: flex;
    align-items: center;
    gap: 6px;

    color: var(--text-secondary);
}
</style>
