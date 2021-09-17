<script>
import { computed, defineComponent, onMounted, ref } from "vue"
import { DateTime } from "luxon"

/**
 * API
 */
import { fetchUserWithdrawals } from "@/api/users"

/**
 * Store
 */
import { useAccountStore } from "@/store/account"

export default defineComponent({
    name: "WithdrawalsTab",

    setup() {
        const accountStore = useAccountStore()

        const withdrawals = ref([])

        onMounted(async () => {
            withdrawals.value = await fetchUserWithdrawals({
                address: accountStore.pkh,
            })
        })

        const formatWhen = isoTime => {
            const dt = DateTime.fromISO(isoTime)
            return `${dt.toLocaleString({
                day: "numeric",
                month: "short",
            })}, ${dt.toLocaleString(DateTime.TIME_SIMPLE)}`
        }

        /** Stats */
        const inTotal = computed(() =>
            withdrawals.value.reduce((acc, curr) => acc + curr.amount, 0),
        )

        return { withdrawals, formatWhen, inTotal }
    },
})
</script>

<template>
    <div :class="$style.wrapper">
        <div v-if="withdrawals.length" :class="$style.block">
            <div :class="$style.subtitle">STATS</div>

            <div :class="$style.stats">
                <div :class="$style.stat">
                    <div :class="$style.key">In Total</div>
                    <div :class="$style.value">
                        {{ inTotal.toFixed(2) }} <span>XTZ</span>
                    </div>
                </div>
                <div :class="$style.stat">
                    <div :class="$style.key">Lucky Symbol</div>
                    <div :class="$style.value">XTZ/USD</div>
                </div>
                <div :class="$style.stat">
                    <div :class="$style.key">Withdrawals</div>
                    <div :class="$style.value">{{ withdrawals.length }}</div>
                </div>
            </div>
        </div>

        <div :class="$style.block">
            <div :class="$style.subtitle">Your withdrawals</div>

            <div :class="$style.items">
                <div
                    v-for="withdraw in withdrawals"
                    :key="withdraw.id"
                    :class="$style.withdraw"
                >
                    <div :class="$style.left">
                        <Icon name="money" size="16" />

                        <div :class="$style.amount">
                            +{{ withdraw.amount.toFixed(2) }} <span>XTZ</span>
                        </div>
                    </div>

                    <div :class="$style.right">
                        <div :class="$style.when">
                            {{ formatWhen(withdraw.event.closed_oracle_time) }}
                        </div>
                        <div :class="$style.dot" />
                        <div :class="$style.event_link">Event</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style module>
.wrapper {
    padding: 20px;

    display: flex;
    flex-direction: column;
    gap: 24px;
}

.subtitle {
    font-size: 10px;
    line-height: 1;
    font-weight: bold;
    color: var(--text-tertiary);
    text-transform: uppercase;

    margin-bottom: 12px;
}

.stats {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.stat {
    display: flex;
    align-items: center;
    justify-content: space-between;

    font-size: 12px;
    line-height: 1;
    font-weight: 500;
}

.key {
    color: var(--text-secondary);
}

.value {
    color: var(--text-primary);
}

.value span {
    color: var(--text-tertiary);
}

.items {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.withdraw {
    display: flex;
    align-items: center;
    justify-content: space-between;

    border-radius: 8px;
    border: 1px solid var(--border);
    height: 40px;
    padding: 0 12px;
}

.left {
    display: flex;
    align-items: center;
    gap: 8px;
}

.left svg {
    fill: var(--icon);
}

.amount {
    font-size: 13px;
    line-height: 1.2;
    font-weight: 600;
    color: var(--text-primary);
}

.amount span {
    color: var(--text-tertiary);
}

.right {
    display: flex;
    align-items: center;
    gap: 10px;
}

.dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--border);
}

.when {
    font-size: 12px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-tertiary);
}

.event_link {
    font-size: 12px;
    line-height: 1;
    font-weight: 500;
    color: var(--blue);

    cursor: pointer;
}
</style>
