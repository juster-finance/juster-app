<script setup>
import { computed } from "vue"
import { DateTime } from "luxon"

/**
 * Store
 */
import { useAccountStore } from "@/store/account"

/**
 * Services
 */
import { supportedMarkets } from "@/services/config"

const props = defineProps(["event", "amount", "countdown"])

const accountStore = useAccountStore()

const symbol = computed(() => props.event.currencyPair.symbol)

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
</script>

<template>
    <div :class="$style.wrapper">
        <div :class="$style.from">
            <div :class="$style.crc">
                <img
                    :src="`https://services.tzkt.io/v1/avatars/${accountStore.pkh}`"
                    :class="$style.image"
                    alt="avatar"
                />
            </div>

            <div :class="$style.meta">
                <div :class="$style.name">
                    {{
                        `${accountStore.pkh.slice(
                            0,
                            6,
                        )}..${accountStore.pkh.slice(
                            accountStore.pkh.length - 4,
                            accountStore.pkh.length,
                        )}`
                    }}
                </div>
                <div :class="$style.subname">
                    <span
                        @click="amount.value = Math.floor(accountStore.balance)"
                        @dblclick="amount.value = accountStore.balance / 2"
                        >{{ accountStore.balance }}</span
                    >
                    ꜩ
                </div>
            </div>
        </div>

        <Icon name="arrowright" size="16" :class="$style.direction_icon" />

        <div :class="$style.to">
            <div :class="$style.crc">
                <Icon name="sides" size="16" />
            </div>

            <div :class="$style.meta">
                <div :class="$style.name">
                    <Icon name="event_new" size="14" />{{
                        supportedMarkets[symbol].description
                    }}
                </div>

                <div :class="$style.subname">
                    <span
                        >{{
                            DateTime.fromISO(event.betsCloseTime)
                                .setLocale("en")
                                .toRelative()
                        }} </span
                    >, {{ timing.start.time }}
                </div>
            </div>
        </div>
    </div>
</template>

<style module>
.wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.from,
.to {
    display: flex;
    align-items: center;
    gap: 14px;
}

.crc {
    display: flex;
    border-radius: 50%;
    background: var(--btn-secondary-bg);
    overflow: hidden;
}

.crc img {
    width: 40px;
    height: 40px;
    padding: 4px;
}

.crc svg {
    box-sizing: content-box;
    padding: 12px;
    fill: var(--text-secondary);
}

.meta {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.name {
    display: flex;
    align-items: center;
    gap: 6px;

    font-size: 14px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-primary);
}

.name svg {
    fill: var(--green);
}

.subname {
    font-size: 12px;
    line-height: 1.1;
    font-weight: 500;
    color: var(--text-tertiary);
}

.subname span {
    cursor: pointer;
    font-weight: 600;
    color: var(--text-secondary);
}

.direction_icon {
    fill: var(--text-tertiary);
}
</style>