<script>
import { defineComponent, computed, toRefs, watch, ref } from "vue"

export default defineComponent({
    name: "SplittedPool",
    props: {
        event: Object,
        amount: [Number, String],
        winDelta: Number,
        side: String,
    },

    setup(props) {
        const { event, amount, winDelta, side } = toRefs(props)

        const userAmount = computed(() => (amount.value ? amount.value : 0))

        // eslint-disable-next-line vue/return-in-computed-property
        const abovePercent = computed(() => {
            if (!userAmount.value || side.value == "Liquidity") {
                if (!event.value.poolAboveEq && !event.value.poolBelow) return 0

                return (
                    (event.value.poolAboveEq * 100) /
                    (event.value.poolAboveEq + event.value.poolBelow)
                )
            } else {
                if (side.value == "Rise") {
                    const below = event.value.poolBelow - winDelta.value
                    const above = event.value.poolAboveEq + userAmount.value

                    return (above * 100) / (above + below)
                }
                if (side.value == "Fall") {
                    const below = event.value.poolBelow + userAmount.value
                    const above = event.value.poolAboveEq - winDelta.value

                    return (above * 100) / (above + below)
                }
            }
        })
        const aboveAmount = computed(() => {
            if (side.value == "Rise")
                return event.value.poolAboveEq + userAmount.value

            if (side.value == "Fall")
                return event.value.poolAboveEq - winDelta.value

            if (side.value == "Liquidity") {
                const maxPool = Math.max(
                    event.value.poolAboveEq,
                    event.value.poolBelow,
                )
                const newAboveEq =
                    event.value.poolAboveEq +
                    (event.value.poolAboveEq / maxPool) * userAmount.value

                return newAboveEq
            }

            return 0
        })

        // eslint-disable-next-line vue/return-in-computed-property
        const belowPercent = computed(() => {
            if (!userAmount.value || side.value == "Liquidity") {
                if (!event.value.poolAboveEq && !event.value.poolBelow) return 0

                return (
                    (event.value.poolBelow * 100) /
                    (event.value.poolAboveEq + event.value.poolBelow)
                )
            } else {
                if (side.value == "Rise") {
                    const below = event.value.poolBelow - winDelta.value
                    const above = event.value.poolAboveEq + userAmount.value

                    return (below * 100) / (above + below)
                }
                if (side.value == "Fall") {
                    const below = event.value.poolBelow + userAmount.value
                    const above = event.value.poolAboveEq - winDelta.value

                    return (below * 100) / (above + below)
                }
            }
        })
        const belowAmount = computed(() => {
            if (side.value == "Rise")
                return event.value.poolBelow - winDelta.value
            if (side.value == "Fall")
                return event.value.poolBelow + userAmount.value

            if (side.value == "Liquidity") {
                const maxPool = Math.max(
                    event.value.poolAboveEq,
                    event.value.poolBelow,
                )
                const newBelow =
                    event.value.poolBelow +
                    (event.value.poolBelow / maxPool) * userAmount.value

                return newBelow
            }

            return 0
        })

        return { abovePercent, aboveAmount, belowPercent, belowAmount }
    },
})
</script>

<template>
    <div :class="$style.wrapper">
        <div :class="$style.head">
            <div :class="$style.left">
                <div :class="$style.name">
                    Rise
                    <span
                        >{{
                            abovePercent % 1 == 0
                                ? abovePercent
                                : abovePercent.toFixed(2)
                        }}%</span
                    >
                </div>

                <div :class="$style.dot" />

                <div :class="$style.size">
                    <Icon name="money" size="12" />
                    {{ aboveAmount.toFixed(0) }}
                    <span>ꜩ</span>
                </div>
            </div>

            <div :class="$style.right">
                <div :class="$style.size">
                    <Icon name="money" size="12" />
                    {{ belowAmount.toFixed(0) }}
                    <span>ꜩ</span>
                </div>

                <div :class="$style.dot" />

                <div :class="$style.name">
                    Fall
                    <span
                        >{{
                            belowPercent % 1 == 0
                                ? belowPercent
                                : belowPercent.toFixed(2)
                        }}%</span
                    >
                </div>
            </div>
        </div>

        <div :class="$style.pool">
            <div
                :style="{ width: `${abovePercent - 1}%` }"
                :class="[$style.fill, $style.rise]"
            />
            <div
                :style="{ width: `${belowPercent - 1}%`, right: 0 }"
                :class="[$style.fill, $style.fall]"
            />
        </div>
    </div>
</template>

<style module>
.wrapper {
    border-radius: 8px;
    border: 1px solid var(--border);
    padding: 16px;
}

.head {
    display: flex;
    align-items: center;
    justify-content: space-between;

    margin-bottom: 10px;
}

.left,
.right {
    display: flex;
    align-items: center;
    gap: 12px;
}

.dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--border);
}

.name {
    font-size: 12px;
    line-height: 1.1;
    font-weight: 600;
    color: var(--text-secondary);
}

.name span {
    color: var(--text-tertiary);
}

.size {
    display: flex;
    align-items: center;
    gap: 4px;

    fill: var(--opacity-40);

    font-size: 11px;
    line-height: 1.1;
    font-weight: 600;
    color: var(--text-primary);
}

.size span {
    color: var(--text-tertiary);
}

.pool {
    position: relative;

    width: 100%;
    height: 4px;
    border-radius: 50px;
    background: var(--opacity-10);

    margin-bottom: 4px;
}

.fill {
    position: absolute;
    top: 0;
    bottom: 0;

    width: 0%;

    height: 4px;
    border-radius: 50px;

    transition: width 0.5s ease;
}

.fill.rise {
    background: var(--green);
}

.fill.fall {
    background: var(--orange);
}
</style>
