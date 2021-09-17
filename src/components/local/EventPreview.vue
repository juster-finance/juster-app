<script>
import { defineComponent, computed, ref, toRefs } from "vue"
import { DateTime } from "luxon"

/**
 * Services
 */
import { supportedSymbols } from "@/services/config"

export default defineComponent({
    name: "EventPreview",
    props: { event: Object, countdown: String, status: String },

    setup(props) {
        const { event, countdown, status } = toRefs(props)

        // eslint-disable-next-line vue/return-in-computed-property
        const name = computed(() => {
            return supportedSymbols[event.value.currency_pair.symbol]
                .description
        })

        /** Event day */
        const todayDt = DateTime.now()
        const eventDt = DateTime.fromISO(event.value.bets_close_time)
        const day = ref(
            todayDt.hasSame(eventDt, "day")
                ? "Today"
                : eventDt.toLocaleString({ month: "long", day: "numeric" }),
        )

        const period = {
            start: eventDt.setLocale("ru").toLocaleString(DateTime.TIME_SIMPLE),
            end: eventDt
                .plus(event.value.measure_period * 1000)
                .setLocale("ru")
                .toLocaleString(DateTime.TIME_SIMPLE),
        }

        return { name, day, period, countdown, status }
    },
})
</script>

<template>
    <div :class="$style.wrapper">
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
            <span>Closing in</span>

            <div v-if="status == 'In progress'" :class="$style.time">
                <Icon name="time" size="12" /> {{ countdown }}
            </div>
            <div v-else-if="status == 'Finished'" :class="$style.time">
                Event closed
            </div>
        </div>
    </div>
</template>

<style module>
.wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;

    height: 62px;
    border-radius: 8px;
    padding: 0 16px;
    border: 1px solid var(--border);
}

.left {
    display: flex;
    flex-direction: column;
    gap: 10px;
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
</style>
