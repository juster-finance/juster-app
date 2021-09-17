<script>
import { computed, defineComponent, toRefs } from "vue"

/**
 * UI
 */
import Spin from "@/components/ui/Spin"

export default defineComponent({
    name: "EventTargetsCard",
    props: { event: Object, price: Object },

    setup(props) {
        const { event, price } = toRefs(props)

        const wonSide = computed(() => {
            if (["NEW", "STARTED"].includes(event.value.status)) {
                return "TBD"
            }
            if (event.value.status == "FINISHED") {
                return event.winner_bets == "ABOVE_EQ" ? "Up" : "Down"
            }
        })

        const change = computed(() => {
            const startRate = event.value.start_rate * 100
            const percent =
                (100 * Math.abs(price.value.rate - startRate)) /
                ((price.value.rate + startRate) / 2)

            return { diff: price.value.rate - startRate, percent }
        })

        return { wonSide, change }
    },

    components: { Spin },
})
</script>

<template>
    <div :class="$style.wrapper">
        <div :class="$style.title">
            Targets
        </div>

        <div :class="$style.targets">
            <div :class="$style.names">
                <div :class="$style.name">
                    Start rate
                </div>

                <div :class="$style.name">
                    Closed rate
                </div>
            </div>

            <div :class="$style.items">
                <div :class="$style.item">
                    <div
                        :class="[
                            $style.target,
                            event.status == 'NEW' && $style.tbd,
                        ]"
                    >
                        <Icon name="go" size="14" />
                        {{
                            event.status == "NEW"
                                ? "TBD"
                                : `$ ${(event.start_rate * 100).toFixed(2)}`
                        }}
                    </div>
                </div>

                <div :class="$style.line">
                    <div :class="$style.line_dot" />
                </div>

                <div :class="$style.item">
                    <div
                        :class="[
                            $style.target,
                            event.status !== 'FINISHED' && $style.tbd,
                        ]"
                    >
                        <Spin v-if="event.status == 'STARTED'" size="14" />
                        <Icon v-else name="flag" size="14" />
                        {{
                            event.status == "FINISHED"
                                ? `$ ${(event.closed_rate * 100).toFixed(2)}`
                                : "TBD"
                        }}
                    </div>
                </div>
            </div>
        </div>

        <div :class="$style.params">
            <div :class="$style.param">
                <span>Current rate</span>
                <span v-if="price.rate">$ {{ price.rate.toFixed(2) }}</span>
                <Spin size="16" v-else />
            </div>
            <div :class="$style.param">
                <span>Difference</span>
                <span v-if="price.rate"
                    >{{ change.diff.toFixed(2) }} ({{
                        change.percent.toFixed(2)
                    }}%)</span
                ><Spin size="16" v-else />
            </div>
            <div :class="$style.param">
                <span>Winning side</span>
                <span v-if="price.rate">
                    <Icon
                        v-if="event.status == 'FINISHED'"
                        name="higher"
                        size="16"
                        :class="wonSide == 'Up' ? $style.up : $style.down"
                    />
                    {{ wonSide }}</span
                ><Spin size="16" v-else />
            </div>
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

    margin-bottom: 20px;
}

.targets {
    display: flex;
    flex-direction: column;
    gap: 8px;

    margin-bottom: 32px;
}

.names {
    display: flex;
    justify-content: space-between;
}

.items {
    display: flex;
    align-items: center;
}

.item {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.name {
    font-size: 12px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-tertiary);
    white-space: nowrap;
}

.target {
    display: flex;
    align-items: center;
    gap: 10px;

    border-radius: 8px;
    height: 32px;
    padding: 0 12px;
    border: 1px solid var(--border);

    font-size: 14px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-primary);
    fill: var(--green);
    white-space: nowrap;
}

.target.tbd {
    color: var(--text-tertiary);
}

.line {
    position: relative;
    width: 100%;
    border-bottom: 1px dashed var(--border);
}

.line_dot {
    width: 5px;
    height: 5px;
    background: #fff;
    border-radius: 50%;

    position: absolute;
    left: 50%;
    top: -2px;
}

.params {
    display: flex;
    justify-content: space-between;
}

.param {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.param span:nth-child(1) {
    font-size: 12px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-tertiary);
}

.param span:nth-child(2) {
    display: flex;
    align-items: center;
    gap: 8px;

    font-size: 16px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-primary);
}

.up {
    fill: var(--green);
}

.down {
    transform: rotate(180deg);
    fill: var(--red);
}
</style>
