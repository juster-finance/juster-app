<script>
import { computed, defineComponent, toRefs } from "vue"

/**
 * Local
 */
import Pool from "@/components/local/Pool"

export default defineComponent({
    name: "EventDetailsCard",
    props: { event: Object },

    setup(props) {
        const { event } = toRefs(props)

        const risePool = computed(() =>
            event.value.bets
                .filter(bet => bet.side == "ABOVE_EQ")
                .reduce((acc, { amount }) => acc + amount, 0),
        )
        const fallPool = computed(() =>
            event.value.bets
                .filter(bet => bet.side == "BELOW")
                .reduce((acc, { amount }) => acc + amount, 0),
        )

        return { risePool, fallPool }
    },

    components: { Pool },
})
</script>

<template>
    <div :class="$style.wrapper">
        <div :class="$style.title">
            Liquidity Pool <Icon name="help" size="14" />
        </div>

        <Pool :event="event" />

        <div :class="$style.hint">
            Users bet <span>{{ risePool }} XTZ</span> for the fact that the
            price will rise and <span>{{ fallPool }} XTZ</span> for a fall. Make
            your choice.
        </div>
    </div>
</template>

<style module>
.wrapper {
    border-radius: 8px;
    border: 1px solid var(--border);
    padding: 20px;
    background: var(--card-bg);
}

.title {
    display: flex;
    align-items: center;
    gap: 6px;

    font-size: 14px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-primary);
    fill: var(--opacity-40);

    margin-bottom: 20px;
}

.hint {
    font-size: 12px;
    line-height: 1.6;
    color: var(--text-tertiary);

    margin-top: 16px;
}

.hint span {
    color: var(--text-secondary);
}
</style>
