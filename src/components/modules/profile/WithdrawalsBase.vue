<script>
import { defineComponent, onMounted, ref } from "vue"
import { useMeta } from "vue-meta"

/**
 * UI
 */
import Button from "@/components/ui/Button"

/**
 * Local
 */
import EventCard from "@/components/local/EventCard"

/**
 * API
 */
import { fetchUserWithdrawals } from "@/api/users"
import { fetchUserPositionsForWithdrawal } from "@/api/positions"

/**
 * Services
 */
import { numberWithSymbol } from "@/services/utils/amounts"

/**
 * Store
 */
import { useAccountStore } from "@/store/account"

export default defineComponent({
    name: "WithdrawalsBase",

    setup() {
        const accountStore = useAccountStore()

        const withdrawals = ref([])
        const positionsForWithdrawal = ref([])

        onMounted(async () => {
            withdrawals.value = await fetchUserWithdrawals({
                address: accountStore.pkh,
            })

            positionsForWithdrawal.value = await fetchUserPositionsForWithdrawal(
                {
                    address: accountStore.pkh,
                },
            )
        })

        /** Meta */
        useMeta({
            title: "Withdrawals",
        })

        return { withdrawals, positionsForWithdrawal, numberWithSymbol }
    },

    components: { Button, EventCard },
})
</script>

<template>
    <div :class="$style.wrapper">
        <metainfo>
            <template v-slot:title="{ content }"
                >{{ content }} • Juster</template
            >
        </metainfo>

        <div :class="$style.block">
            <h2>Outstanding balances</h2>
            <div :class="$style.description">
                List of events holding your unclaimed profits
            </div>

            <div v-if="positionsForWithdrawal.length" :class="$style.items">
                <EventCard
                    v-for="position in positionsForWithdrawal"
                    :key="position.event.id"
                    :event="position.event"
                    won
                    showSymbol
                />
            </div>
            <div v-else :class="$style.empty">
                <Icon name="help" size="16" /> No funds available for withdrawal
            </div>
        </div>

        <div :class="$style.block">
            <h2>Withdrawal history</h2>
            <div :class="$style.description">
                Claimed profits
            </div>

            <div :class="$style.withdrawboard">
                <table v-if="withdrawals.length">
                    <tr>
                        <th>withdraw</th>
                        <th>amount</th>
                        <th>event</th>
                        <th>type</th>
                    </tr>

                    <tr
                        v-for="withdraw in withdrawals.slice(0, 5)"
                        :key="withdraw.id"
                    >
                        <td>
                            <div :class="$style.user">
                                <div :class="$style.money_icon">
                                    <Icon name="money" size="16" />
                                </div>

                                <div :class="$style.info">
                                    <div :class="$style.name">
                                        Withdraw <span>#{{ withdraw.id }}</span>
                                    </div>
                                    <div :class="$style.tier">
                                        {{
                                            new Date(
                                                withdraw.event.closedOracleTime,
                                            ).toLocaleDateString()
                                        }}
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td>
                            +{{
                                numberWithSymbol(
                                    withdraw.amount.toFixed(2),
                                    ",",
                                )
                            }}
                            <span>XTZ</span>
                        </td>
                        <td>
                            <router-link :to="`/events/${withdraw.event.id}`"
                                >Event
                                <span
                                    >#{{ withdraw.event.id }}
                                </span></router-link
                            >
                        </td>
                        <td>
                            {{
                                withdraw.type == "MANUAL"
                                    ? "Manual"
                                    : "Third party"
                            }}
                        </td>
                    </tr>
                </table>

                <div :class="$style.bottom">
                    <span>{{ withdrawals.length }} withdrawals</span>

                    <span v-if="withdrawals.length"
                        >Last 5 withdrawals. Pagination will be available
                        soon</span
                    >
                </div>
            </div>
        </div>

        <div :class="$style.hint_block">
            <Icon name="help" size="20" />

            <div>
                <div :class="$style.hint">
                    You can withdraw your funds manually, however if not done
                    within 24 hours, Juster will do that for you and charge a
                    small fee.
                </div>

                <Button type="tertiary" size="small"
                    ><Icon name="book" size="14" />Read more in the docs</Button
                >
            </div>
        </div>
    </div>
</template>

<style module>
.block {
    margin-bottom: 40px;
}

.block h2 {
    font-family: "CalSans";
}

.description {
    font-size: 14px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-tertiary);

    margin-top: 8px;
    margin-bottom: 24px;
}

.withdrawboard {
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--card-bg);
}

.withdrawboard table {
    width: 100%;
    border-spacing: 0;
}

.withdrawboard tr {
    display: flex;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
}

.withdrawboard th {
    text-transform: uppercase;
    font-size: 12px;
    line-height: 1;
    font-weight: 700;
    color: var(--text-tertiary);

    cursor: pointer;

    display: flex;
    flex: 1;
    align-items: flex-start;
}

.withdrawboard td {
    display: flex;
    align-items: center;
    gap: 4px;

    font-size: 14px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-primary);
    fill: var(--text-tertiary);

    flex: 1;
    padding: 0;
}

.withdrawboard td span {
    color: var(--text-tertiary);
}

.bottom {
    display: flex;
    justify-content: space-between;

    font-size: 12px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-tertiary);

    padding: 16px 20px;
}

.user {
    display: flex;
    align-items: center;
}

.money_icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    fill: var(--icon);

    display: flex;
    align-items: center;
    justify-content: center;

    margin-right: 14px;
}

.name {
    margin-bottom: 6px;
}

.name span {
    color: var(--text-tertiary);
}

.tier {
    font-size: 12px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-tertiary);
}

.hint_block {
    display: flex;
    gap: 12px;

    margin-bottom: 60px;
}

.hint_block svg {
    fill: var(--icon);
}

.hint {
    font-size: 14px;
    line-height: 1.6;
    color: var(--text-tertiary);
    max-width: 500px;

    margin-bottom: 12px;
}

.items {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    grid-gap: 16px;

    margin-top: 24px;
}

.empty {
    display: flex;
    align-items: center;
    gap: 8px;

    font-size: 14px;
    line-height: 1.6;
    color: var(--text-tertiary);
    fill: var(--text-tertiary);
}
</style>
