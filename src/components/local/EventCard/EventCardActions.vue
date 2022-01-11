<script setup>
import { defineEmits, defineProps, computed, isReactive } from "vue"

import { f } from "@/services/utils/amounts"

/**
 * UI
 */
import Button from "@/components/ui/Button"
import Spin from "@/components/ui/Spin"

/**
 * Store
 */
import { useAccountStore } from "@/store/account"

const props = defineProps({
    event: Object,
    won: Boolean,
    wonPosition: Object,
    disabled: Boolean,
    isWithdrawing: Boolean,
})
const emit = defineEmits(["onBet", "onWithdraw"])

const ratio = computed(() => {
    if (!props.event.poolBelow || !props.event.poolAboveEq) return 0

    return {
        rise: props.event.poolBelow / props.event.poolAboveEq,
        fall: props.event.poolAboveEq / props.event.poolBelow,
    }
})

const accountStore = useAccountStore()
</script>

<template>
    <div :class="$style.wrapper">
        <template v-if="!won && !wonPosition">
            <div
                @click.prevent="emit('onBet', 'rise')"
                :class="[$style.action, disabled && $style.disabled]"
            >
                <div :class="$style.left">
                    <Icon name="higher" size="14" :class="$style.higher_icon" />

                    <span>Rise</span>
                </div>

                <div :class="$style.ratio">
                    <Icon name="close" size="10" />

                    <span v-if="ratio.rise">{{
                        (1 + ratio.rise).toFixed(2)
                    }}</span>
                    <span v-else>0.00</span>
                </div>
            </div>

            <div :class="$style.divider" />

            <div
                @click.prevent="emit('onBet', 'fall')"
                :class="[$style.action, disabled && $style.disabled]"
            >
                <div :class="$style.ratio">
                    <Icon name="close" size="10" />

                    <span v-if="ratio.fall">{{
                        (1 + ratio.fall).toFixed(2)
                    }}</span>
                    <span v-else>0.00</span>
                </div>

                <div :class="$style.left">
                    <span>Fall</span>

                    <Icon name="lower" size="14" :class="$style.lower_icon" />
                </div>
            </div>
        </template>

        <Button
            v-else
            @click.prevent="emit('onWithdraw')"
            :type="
                (isWithdrawing && 'secondary') ||
                (won && !wonPosition && 'secondary') ||
                (won && wonPosition && 'success')
            "
            size="small"
            :disabled="isWithdrawing || (won && !wonPosition)"
            block
        >
            <template v-if="won && !wonPosition"
                >Successfully withdrawn</template
            >

            <template v-else-if="accountStore.pendingTransaction.awaiting">
                Can`t withdraw now
            </template>

            <template v-else-if="!isWithdrawing">
                <Icon name="crown" size="16" />Withdraw
                {{ f(wonPosition.value) }} XTZ
            </template>

            <template v-else
                ><Spin size="12" />Awaiting confirmation..
            </template>
        </Button>
    </div>
</template>

<style module>
.wrapper {
    display: flex;
    align-items: center;
    width: 100%;
    overflow: hidden;

    border-radius: 6px;
}

.action {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 1;

    background: #29292b;

    padding: 0 12px;
    height: 32px;

    transition: background 0.2s ease;
}

.action.disabled {
    pointer-events: none;
    opacity: 0.5;
}

.action:hover {
    background: #313133;
}

.left {
    display: flex;
    align-items: center;
    gap: 6px;
}

.left span {
    font-size: 12px;
    line-height: 1.1;
    font-weight: 600;
    color: var(--text-primary);
}

.higher_icon {
    fill: var(--green);
}

.lower_icon {
    fill: var(--orange);
}

.ratio {
    display: flex;
    align-items: center;
    gap: 1px;

    font-size: 11px;
    line-height: 1.1;
    font-weight: 600;
    color: var(--text-secondary);
}

.ratio svg {
    fill: var(--text-tertiary);
}

.divider {
    height: 100%;
    width: 1px;

    background: rgba(0, 0, 0, 0.4);
}

.withdraw {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    font-size: 12px;
    line-height: 1.1;
    font-weight: 600;

    border-radius: 6px;
    background: var(--green);

    width: 100%;
    height: 32px;
}
</style>