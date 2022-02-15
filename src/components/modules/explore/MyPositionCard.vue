<script setup>
import { computed } from "vue"
import { DateTime, Duration } from "luxon"

/**
 * UI
 */
import Badge from "@/components/ui/Badge"

/**
 * Services
 */
import { supportedMarkets } from "@/services/config"
import { toReadableDuration } from "@/services/utils/date"
import { abbreviateNumber } from "@/services/utils/amounts"

/**
 * Store
 */
import { useAccountStore } from "@/store/account"
const accountStore = useAccountStore()

const props = defineProps({
    event: { type: Object, required: true },
})

const symbol = computed(() => props.event.currencyPair.symbol)

const eventDuration = computed(() =>
    toReadableDuration({ seconds: props.event.measurePeriod }),
)

const timing = computed(() => {
    const eventDt = DateTime.fromISO(props.event.betsCloseTime).setLocale("en")

    const endDt = eventDt.plus(props.event.measurePeriod * 1000)

    return {
        start: {
            time: eventDt.toLocaleString({
                hour: "numeric",
                minute: "numeric",
            }),
            day: eventDt.toLocaleString({
                day: "numeric",
            }),
            month: eventDt.toLocaleString({ month: "short" }),
        },
        end: {
            time: endDt.toLocaleString({
                hour: "numeric",
                minute: "numeric",
            }),
            day: endDt.toLocaleString({
                day: "numeric",
            }),
            month: endDt.toLocaleString({ month: "short" }),
        },
        showDay: eventDt.ordinal < endDt.ordinal,
    }
})

const value = computed(() => {
    const bets = props.event.bets.reduce((acc, curr) => {
        if (curr.userId == accountStore.pkh) {
            return (acc += curr.amount)
        } else {
            return acc
        }
    }, 0)
    const liquidity = props.event.deposits.reduce((acc, curr) => {
        if (curr.userId == accountStore.pkh) {
            return (acc += curr.amountAboveEq)
        } else {
            return acc
        }
    }, 0)

    return abbreviateNumber(bets + liquidity)
})
</script>

<template>
    <router-link :to="`/events/${event.id}`">
        <div :class="$style.wrapper">
            <div :class="$style.left">
                <div
                    :class="[
                        $style.event_icon,
                        (event.status == 'NEW' && $style.green) ||
                            (event.status == 'STARTED' && $style.yellow),
                    ]"
                >
                    <Icon
                        :name="
                            (event.status == 'NEW' && 'event_new') ||
                            (event.status == 'STARTED' && 'event_active')
                        "
                        size="16"
                    />
                </div>

                <div :class="$style.info">
                    <div :class="$style.title">
                        <img
                            v-if="event.winnerBets == 'ABOVE_EQ'"
                            :src="require('@/assets/icons/higher_won.svg')"
                            alt="won_side_icon"
                        />
                        <img
                            v-else-if="event.winnerBets == 'BELOW'"
                            :src="require('@/assets/icons/lower_won.svg')"
                            alt="won_side_icon"
                        />
                        <Icon v-else name="sides" size="16" />
                        {{
                            supportedMarkets[symbol] &&
                            supportedMarkets[symbol].description
                        }}
                        <span>price event</span>
                    </div>

                    <div :class="$style.timing">
                        <div :class="$style.days">
                            {{
                                `${timing.start.day} ${
                                    timing.showDay ? `- ${timing.end.day}` : ``
                                } ${timing.start.month}`
                            }}
                        </div>

                        <div :class="$style.dot" />

                        <div :class="$style.hrs">
                            {{ timing.start.time }}
                            <span>({{ eventDuration }})</span>
                        </div>
                    </div>
                </div>
            </div>

            <div :class="$style.right">
                <Badge size="medium" color="gray"
                    ><Icon name="wallet" size="14" /> <span>Value:</span>
                    {{ value }} ꜩ</Badge
                >
            </div>
        </div>
    </router-link>
</template>

<style module>
.wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;

    height: 70px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--card-bg);

    padding: 0 20px;
}

.left {
    display: flex;
    align-items: center;
    gap: 16px;
}

.event_icon {
    display: flex;
    align-items: center;
    justify-content: center;

    height: 32px;
    width: 32px;
    border-radius: 8px;
}

.event_icon.green {
    fill: var(--green);
    background: rgba(26, 161, 104, 0.1);
}

.event_icon.yellow {
    fill: var(--yellow);
    background: rgba(245, 183, 43, 0.1);
}

.info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 8px;
}

.title {
    display: flex;
    align-items: center;

    height: 20px;

    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
}

.title img {
    display: flex;

    width: 16px;
    height: 16px;

    margin-right: 6px;
}

.title svg {
    display: flex;

    fill: var(--text-tertiary);

    margin-right: 6px;
}

.title span {
    color: var(--text-tertiary);

    margin-left: 4px;
}

.timing {
    display: flex;
    align-items: center;
    gap: 8px;

    font-size: 12px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-secondary);
}

.days {
    color: var(--text-tertiary);
}

.hrs span {
    color: var(--text-tertiary);
}

.dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--border);
}

.right {
    display: flex;
    align-items: center;
    gap: 8px;
}
</style>