<script>
import { computed, defineComponent, onMounted, reactive, ref } from "vue"
import { useMeta } from "vue-meta"
import { DateTime } from "luxon"

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

        const currentPage = ref(1)
        const paginatedWithdrawals = computed(() =>
            withdrawals.value.slice(
                (currentPage.value - 1) * 5,
                currentPage.value * 5,
            ),
        )

        const positionsForWithdrawal = ref([])

        const statistics = reactive({
            week: {
                value: 0,
                avg: 0,
            },
            month: {
                value: 0,
                avg: 0,
            },
            all: {
                value: 0,
                avg: 0,
            },
        })

        onMounted(async () => {
            withdrawals.value = await fetchUserWithdrawals({
                address: accountStore.pkh,
            })

            positionsForWithdrawal.value =
                await fetchUserPositionsForWithdrawal({
                    address: accountStore.pkh,
                })

            /**
             * Statistics:
             * @Week
             * @Month
             * @AllTime
             */
            const withdrawalsLastWeek = withdrawals.value.filter(
                (withdraw) =>
                    DateTime.fromISO(withdraw.event.closedOracleTime).ts >
                    DateTime.now().minus({ days: 7 }).ts,
            )
            const withdrawalsLastMonth = withdrawals.value.filter(
                (withdraw) =>
                    DateTime.fromISO(withdraw.event.closedOracleTime).ts >
                    DateTime.now().minus({ days: 30 }).ts,
            )

            statistics.week.value = withdrawalsLastWeek.reduce(
                (acc, curr) => acc + curr.amount,
                0,
            )
            statistics.week.avg =
                statistics.week.value / withdrawalsLastWeek.length

            statistics.month.value = withdrawalsLastMonth.reduce(
                (acc, curr) => acc + curr.amount,
                0,
            )
            statistics.month.avg =
                statistics.month.value / withdrawalsLastMonth.length

            statistics.all.value = withdrawals.value.reduce(
                (acc, curr) => acc + curr.amount,
                0,
            )
            statistics.all.avg = statistics.all.value / withdrawals.value.length
        })

        /** Meta */
        useMeta({
            title: "Withdrawals",
        })

        return {
            withdrawals,
            paginatedWithdrawals,
            positionsForWithdrawal,
            currentPage,
            statistics,
            numberWithSymbol,
        }
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
            <h2>Withdraw stats</h2>
            <div :class="$style.description">
                Your withdraw statistics for this month & all time
            </div>

            <div :class="$style.stats">
                <div :class="$style.stat">
                    <div :class="$style.stat_name">Last week</div>
                    <div :class="$style.stat_value">
                        {{ statistics.week.value.toFixed(0) }} XTZ
                    </div>
                    <div :class="$style.stat_avg">
                        Avg
                        <span>{{ statistics.week.avg.toFixed(0) }} XTZ</span>
                        per event
                    </div>
                </div>
                <div :class="$style.stat">
                    <div :class="$style.stat_name">Last month</div>
                    <div :class="$style.stat_value">
                        {{ statistics.month.value.toFixed(0) }} XTZ
                    </div>
                    <div :class="$style.stat_avg">
                        Avg
                        <span>{{ statistics.month.avg.toFixed(0) }} XTZ</span>
                        per event
                    </div>
                </div>
                <div :class="$style.stat">
                    <div :class="$style.stat_name">All time</div>
                    <div :class="$style.stat_value">
                        {{ statistics.all.value.toFixed(0) }} XTZ
                    </div>
                    <div :class="$style.stat_avg">
                        Avg
                        <span>{{ statistics.all.avg.toFixed(0) }} XTZ</span> per
                        event
                    </div>
                </div>
            </div>

            <div :class="$style.hint">
                <Icon name="help" size="14" /><span
                    >Last week & Last month</span
                >
                - here we mean a week from the current day minus 7 days / 30
                days
            </div>
        </div>

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
            <div :class="$style.description">Claimed profits</div>

            <div :class="$style.withdrawboard">
                <table v-if="withdrawals.length">
                    <tr>
                        <th>withdraw</th>
                        <th>amount</th>
                        <th>event</th>
                        <th>type</th>
                    </tr>

                    <tr
                        v-for="withdraw in paginatedWithdrawals"
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

                    <div v-if="withdrawals.length" :class="$style.pagination">
                        <div
                            v-for="page in Math.round(withdrawals.length / 5)"
                            :key="page"
                            @click="currentPage = page"
                            :class="[
                                $style.page,
                                currentPage == page && $style.current,
                            ]"
                        >
                            {{ page }}
                        </div>
                    </div>
                </div>
            </div>

            <div :class="$style.hint">
                <Icon name="help" size="14" />
                You can withdraw your funds manually, however if not done within
                24 hours, Juster will do that for you and charge a small fee.
            </div>
        </div>
    </div>
</template>

<style module>
.wrapper {
    display: flex;
    flex-direction: column;
    gap: 40px;
}

.block {
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

.stats {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
}

.stat {
    flex: 1;

    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 24px;
}

.stat_name {
    font-size: 14px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-tertiary);
}

.stat_value {
    font-size: 24px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-primary);

    margin-top: 16px;
    margin-bottom: 10px;
}

.stat_avg {
    font-size: 11px;
    line-height: 1;
    font-weight: 700;
    color: var(--text-tertiary);
    text-transform: uppercase;
}

.stat_avg span {
    color: var(--text-secondary);
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
    align-items: center;

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

.pagination {
    display: flex;
    align-items: center;
    gap: 6px;
}

.page {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    font-size: 12px;

    width: 24px;
    height: 20px;
    border-radius: 5px;
    background: var(--opacity-05);

    transition: all 0.2s ease;
}

.page.current {
    color: var(--text-primary);
    background: var(--opacity-10);
}

.page:hover {
    background: var(--opacity-10);
}
</style>
