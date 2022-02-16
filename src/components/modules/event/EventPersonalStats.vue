<script setup>
import { computed } from "vue"

/**
 * Store
 */
import { useAccountStore } from "@/store/account"

/**
 * Services
 */
import { abbreviateNumber } from "@/services/utils/amounts"

const props = defineProps({
    event: {
        type: Object,
        default: {},
    },
    userDeposits: {
        type: Array,
        default: [],
    },
    userBets: {
        type: Array,
        default: [],
    },
})

const accountStore = useAccountStore()

const bvl = computed(() =>
    props.userBets.reduce((acc, { amount }) => (acc += amount), 0),
)
const dvl = computed(() =>
    props.userDeposits.reduce(
        (acc, { amountAboveEq }) => (acc += amountAboveEq),
        0,
    ),
)

const returnOnBets = computed(() => {
    let reward = 0

    if (props.event.status == "FINISHED") {
        reward = props.userBets.reduce((acc, { side, reward }) => {
            return side == props.event.winnerBets ? (acc += reward) : acc
        }, 0)
    } else {
        reward = props.userBets.reduce((acc, { reward }) => (acc += reward), 0)
    }

    return reward
})

const profit = computed(() => {
    let reward = 0

    if (props.event.status == "FINISHED") {
        reward = props.userBets.reduce((acc, { side, reward, amount }) => {
            return side == props.event.winnerBets
                ? (acc += reward - amount)
                : acc
        }, 0)
    } else {
        reward = props.userBets.reduce(
            (acc, { amount, reward }) => (acc += reward - amount),
            0,
        )
    }

    return reward
})
</script>

<template>
    <div :class="$style.wrapper">
        <!-- TVL -->
        <div :class="$style.sector">
            <div :class="$style.base">
                <div :class="$style.name">Total Value Locked</div>

                <div :class="$style.amount">
                    {{ abbreviateNumber(dvl + bvl) }}
                    <span>ꜩ</span>
                </div>
            </div>

            <div :class="$style.icon">
                <Icon name="wallet" size="20" />
            </div>
        </div>

        <!-- Returning -->
        <div :class="$style.sector">
            <div :class="$style.base">
                <div :class="$style.name">Returning</div>

                <div :class="$style.amount">
                    {{ abbreviateNumber(returnOnBets + dvl) }} <span>ꜩ</span>
                </div>
            </div>

            <div :class="$style.icon">
                <Icon name="walletadd" size="20" />
            </div>
        </div>

        <!-- Profit -->
        <div :class="$style.sector">
            <div :class="$style.base">
                <div :class="$style.name">
                    {{
                        event.status == "FINISHED"
                            ? "Profit"
                            : "Potential Profit"
                    }}
                </div>

                <div :class="$style.amount">
                    {{ (returnOnBets - bvl).toFixed(2) }} <span>ꜩ</span>
                </div>
            </div>

            <div
                :class="[
                    $style.icon,
                    returnOnBets - bvl > 0 &&
                        event.status == 'FINISHED' &&
                        $style.green,
                ]"
            >
                <Icon name="money" size="20" />
            </div>
        </div>
    </div>

    <div :class="$style.hint">
        <Icon name="help" size="14" />
        <span>Returning & Profit</span> is depends on the current winning side.
        Exact calculations will be indicated at the end of the event
    </div>
</template>

<style module>
.wrapper {
    display: flex;
    align-items: center;
    gap: 18px;

    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--card-bg);
    padding: 0 20px;
}

.sector {
    display: flex;
    align-items: center;
    justify-content: space-between;

    height: 84px;

    flex: 1;
}

.sector:nth-child(1),
.sector:nth-child(2) {
    border-right: 1px solid var(--border);
    padding-right: 18px;
}

.base {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.name {
    font-size: 13px;
    line-height: 1.1;
    font-weight: 600;
    color: var(--text-tertiary);
}

.amount {
    font-size: 20px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-primary);
}

.amount span {
    font-weight: 500;
    font-size: 16px;
    color: var(--text-tertiary);
}

.icon {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--opacity-05);
    fill: var(--text-secondary);
}

.icon.green {
    background: rgba(26, 161, 104, 0.15);
    fill: var(--green);
}

.hint {
    display: flex;
    align-items: center;
    gap: 8px;

    font-size: 12px;
    font-weight: 500;
    line-height: 1.6;
    color: var(--text-tertiary);
    fill: var(--text-tertiary);

    margin-top: 12px;
}

.hint span {
    font-weight: 600;
    color: var(--text-secondary);
}
</style>