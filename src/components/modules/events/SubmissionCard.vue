<script>
import { computed, defineComponent, toRefs } from "vue"

export default defineComponent({
    name: "SubmissionCard",
    props: { submission: Object },

    setup(props) {
        const { submission } = toRefs(props)

        const side = computed(() =>
            submission.value.side == "ABOVE_EQ" ? "Up" : "Down",
        )

        return { side }
    },
})
</script>

<template>
    <div :class="$style.wrapper">
        <div :class="$style.base">
            <div :class="$style.icon">
                <Icon name="bet" size="16" />
            </div>

            <div :class="$style.info">
                <div :class="$style.title">Bid</div>
                <div :class="$style.time">3 min ago</div>
            </div>
        </div>

        <div :class="[$style.param, side == 'Up' ? $style.up : $style.down]">
            <Icon name="higher" size="12" />{{ side }}
        </div>

        <div :class="$style.param">
            {{ submission.amount }}&nbsp;<span>XTZ</span>
        </div>

        <div :class="$style.param">
            {{ submission.reward.toFixed(2) }}&nbsp;<span>XTZ</span>
        </div>
    </div>
</template>

<style module>
.wrapper {
    display: flex;
    align-items: center;

    height: 60px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--card-bg);
    padding: 0 16px;

    transition: border 0.2s ease;
}

.wrapper:hover {
    border: 1px solid var(--border-highlight);
}

.base {
    display: flex;
    align-items: center;
    flex: 2;
}

.icon {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--opacity-10);
    fill: var(--icon);

    margin-right: 16px;
}

.info {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.title {
    font-size: 14px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-primary);
}

.time {
    font-size: 12px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-tertiary);
}

.param {
    display: flex;
    align-items: center;

    font-size: 14px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-primary);

    flex: 1;
}

.param.up {
    fill: var(--green);
}

.param.down {
    fill: var(--red);
}

.param.down svg {
    transform: rotate(180deg);
}

.param svg {
    margin-right: 6px;
}

.param span {
    color: var(--text-tertiary);
}
</style>
