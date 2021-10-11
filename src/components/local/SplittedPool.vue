<script>
import { defineComponent, computed, toRefs, watch, ref } from "vue"

export default defineComponent({
    name: "SplittedPool",
    props: {
        event: Object,
        amount: Number,
        side: String,
    },

    setup(props) {
        const { event, amount, side } = toRefs(props)

        const userAmount = computed(() =>
            amount.value ? parseFloat(amount.value) : 0,
        )

        // eslint-disable-next-line vue/return-in-computed-property
        const abovePercent = computed(() => {
            if (!userAmount.value || side.value == "Liquidity") {
                if (!event.value.poolAboveEq && !event.value.poolBelow)
                    return 0

                return Math.floor(
                    (event.value.poolAboveEq * 100) /
                        (event.value.poolAboveEq + event.value.poolBelow),
                )
            } else {
                if (side.value == "Higher") {
                    const below = event.value.poolBelow
                    const above = event.value.poolAboveEq + userAmount.value

                    return Math.floor((above * 100) / (above + below))
                }
                if (side.value == "Lower") {
                    const below = event.value.poolBelow + userAmount.value
                    const above = event.value.poolAboveEq

                    return Math.floor((above * 100) / (above + below))
                }
            }
        })
        const aboveAmount = computed(() => {
            if (side.value == "Higher" || side.value == "Lower")
                return event.value.poolAboveEq

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
        })

        // eslint-disable-next-line vue/return-in-computed-property
        const belowPercent = computed(() => {
            if (!userAmount.value || side.value == "Liquidity") {
                if (!event.value.poolAboveEq && !event.value.poolBelow)
                    return 0

                return Math.ceil(
                    (event.value.poolBelow * 100) /
                        (event.value.poolAboveEq + event.value.poolBelow),
                )
            } else {
                if (side.value == "Higher") {
                    const below = event.value.poolBelow
                    const above = event.value.poolAboveEq + userAmount.value

                    return Math.ceil((below * 100) / (above + below))
                }
                if (side.value == "Lower") {
                    const below = event.value.poolBelow + userAmount.value
                    const above = event.value.poolAboveEq

                    return Math.ceil((below * 100) / (above + below))
                }
            }
        })
        const belowAmount = computed(() => {
            if (side.value == "Higher" || side.value == "Lower")
                return event.value.poolBelow

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
        })

        return { abovePercent, aboveAmount, belowPercent, belowAmount }
    },
})
</script>

<template>
    <div :class="$style.wrapper">
        <div :class="$style.half">
            <div :class="$style.head">
                <div :class="$style.name">
                    Higher <span>{{ abovePercent }}%</span>
                </div>

                <div :class="$style.size">
                    <Icon name="money" size="12" />
                    {{ aboveAmount.toFixed(2) }}
                    <span>XTZ</span>
                </div>
            </div>

            <div :class="$style.pool">
                <div
                    :style="{ width: `${abovePercent}%` }"
                    :class="[$style.fill, $style.rise]"
                />
            </div>
        </div>

        <div :class="$style.half">
            <div :class="$style.head">
                <div :class="$style.name">
                    Lower <span>{{ belowPercent }}%</span>
                </div>

                <div :class="$style.size">
                    <Icon name="money" size="12" />
                    {{ belowAmount.toFixed(2) }}
                    <span>XTZ</span>
                </div>
            </div>

            <div :class="$style.pool">
                <div
                    :style="{ width: `${belowPercent}%` }"
                    :class="[$style.fill, $style.fall]"
                />
            </div>
        </div>
    </div>
</template>

<style module>
.wrapper {
    height: 104px;
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

    margin-bottom: 14px;
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
