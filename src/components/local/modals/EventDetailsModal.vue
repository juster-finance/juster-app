<script setup>
import { computed } from "vue"
import { DateTime } from "luxon"

/**
 * UI
 */
import Modal from "@/components/ui/Modal"

/**
 * Services
 */
import { toReadableDuration } from "@/services/utils/date"

const props = defineProps({ show: { type: Boolean }, event: { type: Object } })

const eventDuration = computed(() =>
    toReadableDuration({ seconds: props.event.measurePeriod }),
)
</script>

<template>
    <Modal :show="show" width="500" closable @onClose="$emit('onClose')">
        <div :class="$style.title">Event details</div>

        <div :class="$style.subtitle">General</div>
        <div :class="$style.params">
            <div :class="$style.param">
                <span><Icon name="hash" size="12" />Event ID</span>
                <span>{{ event.id }}</span>
            </div>

            <div :class="$style.param">
                <span
                    ><Icon
                        :name="
                            (event.status == 'NEW' && 'event_new') ||
                            (event.status == 'STARTED' && 'event_active') ||
                            (event.status == 'FINISHED' && 'event_finished')
                        "
                        size="12"
                    />Status</span
                >
                <span>{{ event.status }}</span>
            </div>

            <div :class="$style.param">
                <span><Icon name="sides" size="12" />Target Dynamics</span>
                <span>{{ event.targetDynamics }}</span>
            </div>

            <div :class="$style.param">
                <span><Icon name="money" size="12" />Total Value Locked</span>
                <span>{{ event.totalValueLocked }}</span>
            </div>

            <div :class="$style.param">
                <span><Icon name="time" size="12" />Measure Period</span>
                <span>{{ eventDuration }}</span>
            </div>
        </div>

        <div :class="$style.subtitle">Time</div>
        <div :class="$style.params">
            <div :class="$style.param">
                <span><Icon name="time" size="12" />Created At</span>
                <span>{{ DateTime.fromISO(event.createdTime).toHTTP() }}</span>
            </div>
            <div :class="$style.param">
                <span><Icon name="time" size="12" />Bets Close Time</span>
                <span>{{
                    DateTime.fromISO(event.betsCloseTime).toHTTP()
                }}</span>
            </div>
        </div>

        <div :class="$style.subtitle">Liquidity</div>
        <div :class="$style.params">
            <div :class="$style.param">
                <span><Icon name="liquidity" size="12" /> Provided</span>
                <span>{{ event.totalLiquidityProvided }}</span>
            </div>

            <div :class="$style.param">
                <span><Icon name="liquidity" size="12" /> Shares</span>
                <span>{{ event.totalLiquidityShares }}</span>
            </div>

            <div :class="$style.param">
                <span><Icon name="liquidity" size="12" /> Percent</span>
                <span>{{ event.liquidityPercent * 100 }}%</span>
            </div>

            <div :class="$style.param">
                <span
                    ><Icon name="liquidity" size="12" /> Pool: Rise / Fall</span
                >
                <span>{{ event.poolAboveEq }} / {{ event.poolBelow }}</span>
            </div>
        </div>

        <div :class="$style.subtitle">Price</div>
        <div :class="$style.params">
            <div :class="$style.param">
                <span><Icon name="money" size="12" /> Start Price</span>
                <span>{{ event.startRate }}</span>
            </div>

            <div :class="$style.param">
                <span><Icon name="money" size="12" /> Closed Price</span>
                <span>{{ event.closedRate }}</span>
            </div>
        </div>
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

    margin-bottom: 32px;
}

.subtitle {
    font-size: 12px;
    font-weight: 700;
    color: var(--text-secondary);

    margin-bottom: 16px;
}

/* Params */
.params {
    display: flex;
    flex-direction: column;
    gap: 20px;

    margin-bottom: 24px;
}

.params:last-of-type {
    margin-bottom: 0;
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
