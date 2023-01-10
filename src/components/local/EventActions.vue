<script setup>
import { computed } from "vue"

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
const accountStore = useAccountStore()

const props = defineProps({
    primary: Boolean,
    event: Object,
    isWon: Boolean,
    positionForWithdraw: Object,
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

const successfulWithdrawal = computed(() =>
    accountStore.withdrawals.find(
        (withdrawal) => withdrawal.event.id == props.event.id,
    ),
)

const btnType = computed(() => {
    if (props.isWithdrawing || accountStore.pendingTransaction.awaiting) {
        return "secondary"
    }

    if (props.isWon && props.positionForWithdraw) {
        return "success"
    } else {
        return "secondary"
    }
})

const isFinished = computed(() => {
    return (
        props.event.status === "FINISHED" || props.event.status === "CANCELED"
    )
})
</script>

<template>
    <div :class="$style.wrapper">
        <template
            v-if="
                !isWon &&
                !positionForWithdraw &&
                !successfulWithdrawal &&
                !isFinished
            "
        >
            <div
                @click.prevent="emit('onBet', 'rise')"
                :class="[
                    $style.action,
                    primary && $style.primary,
                    disabled && $style.disabled,
                ]"
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
                :class="[
                    $style.action,
                    primary && $style.primary,
                    disabled && $style.disabled,
                ]"
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
            :type="btnType"
            size="small"
            :disabled="
                isWithdrawing ||
                (isWon && !positionForWithdraw) ||
                !!successfulWithdrawal?.amount ||
                accountStore.pendingTransaction.awaiting
            "
            block
        >
            <template v-if="successfulWithdrawal"
                >Successfully withdrawn
                {{ successfulWithdrawal?.amount.toFixed(2) }} ꜩ</template
            >

            <template v-else-if="accountStore.pendingTransaction.awaiting">
                Can`t withdraw right now
            </template>

            <template v-else-if="!isWithdrawing && positionForWithdraw">
                <Icon name="crown" size="16" />Withdraw
                {{ f(positionForWithdraw.value) }} ꜩ
            </template>

            <template v-else-if="!isWon">No funds to withdraw</template>

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

.action.primary {
    background: #285dbf;
}

.action.disabled {
    pointer-events: none;
    opacity: 0.5;
}

.action:hover {
    background: #313133;
}

.action.primary:hover {
    background: #1f4fa8;
}

.left {
    display: flex;
    align-items: center;
    gap: 6px;
}

.left span {
    font-size: 12px;
    line-height: 14px;
    font-weight: 600;
    color: var(--text-primary);
}

.action .higher_icon {
    fill: var(--green);
}

.action .lower_icon {
    fill: var(--orange);
}

.action.primary .higher_icon {
    fill: var(--text-secondary);
}

.action.primary .lower_icon {
    fill: var(--text-secondary);
}

.action .ratio {
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

.action.primary .ratio {
    color: var(--text-tertiary);
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
