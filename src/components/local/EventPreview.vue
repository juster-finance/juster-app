<script>
import { defineComponent, computed, ref, toRefs } from "vue"
import { DateTime } from "luxon"

/**
 * Services
 */
import { supportedSymbols } from "@/services/config"

export default defineComponent({
    name: "EventPreview",
    props: { event: Object, countdown: String, status: String, type: String },

    setup(props, context) {
        const { event, countdown, status } = toRefs(props)

        // eslint-disable-next-line vue/return-in-computed-property
        const name = computed(() => {
            return supportedSymbols[event.value.currencyPair.symbol].description
        })

        /** Event day */
        const todayDt = DateTime.now()
        const eventDt = DateTime.fromISO(event.value.betsCloseTime)
        const day = ref(
            todayDt.hasSame(eventDt, "day")
                ? "Today"
                : eventDt.toLocaleString({ month: "long", day: "numeric" }),
        )

        const period = {
            start: eventDt.setLocale("ru").toLocaleString(DateTime.TIME_SIMPLE),
            end: eventDt
                .plus(event.value.measurePeriod * 1000)
                .setLocale("ru")
                .toLocaleString(DateTime.TIME_SIMPLE),
        }

        const handleSwitch = () => {
            context.emit("switch")
        }

        return { event, name, day, period, countdown, status, handleSwitch }
    },
})
</script>

<template>
    <div :class="$style.wrapper">
        <div :class="$style.base">
            <div :class="$style.left">
                <div :class="$style.name">
                    {{ name }}
                </div>

                <div :class="$style.timing">
                    {{ day }}, <span>{{ period.start }}</span> ->
                    <span>{{ period.end }}</span>
                </div>
            </div>

            <div :class="$style.timer">
                <span>Time left</span>

                <div v-if="status == 'In progress'" :class="$style.time">
                    <Icon name="time" size="12" /> {{ countdown }}
                </div>
                <div
                    v-else-if="
                        status == 'Finished' && event.status == 'STARTED'
                    "
                    :class="$style.time"
                >
                    Event is active
                </div>
                <div
                    v-else-if="
                        status == 'Finished' && event.status == 'FINISHED'
                    "
                    :class="$style.time"
                >
                    Event is finished
                </div>
            </div>
        </div>

        <div v-if="type" :class="$style.actions">
            <div @click="handleSwitch" :class="$style.action">
                {{ type == "liquidity" ? "Make a bet" : "Provide liquidity" }}
            </div>
            <router-link :to="`/events/${event.id}`" :class="$style.action">
                Open event
            </router-link>
        </div>
    </div>
</template>

<style module>
.wrapper {
    border-radius: 8px;
    padding: 14px 16px;
    border: 1px solid var(--border);
}

.base {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.left {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.name {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
}

.timing {
    font-size: 12px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-tertiary);
}

.timing span {
    color: var(--text-secondary);
}

.timer {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
}

.timer span {
    font-size: 12px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-tertiary);
}

.time {
    display: flex;
    align-items: center;
    gap: 6px;

    font-size: 13px;
    line-height: 1.4;
    font-weight: 600;
    color: var(--text-primary);
    fill: var(--opacity-40);
}

.actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;

    margin-top: 16px;
}

.action {
    font-size: 12px;
    line-height: 1;
    font-weight: 600;
    color: var(--blue);
}
</style>
