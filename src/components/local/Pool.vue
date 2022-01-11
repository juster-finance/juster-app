<script>
import { defineComponent, computed, toRefs, ref, watch } from "vue"

export default defineComponent({
    name: "Pool",
    props: {
        event: Object,
    },

    setup(props) {
        const { event } = toRefs(props)

        // eslint-disable-next-line vue/return-in-computed-property
        const abovePercent = computed(() => {
            return Math.floor(
                (event.value.poolAboveEq * 100) /
                    (event.value.poolAboveEq + event.value.poolBelow),
            )
        })

        // eslint-disable-next-line vue/return-in-computed-property
        const belowPercent = computed(() => {
            return Math.ceil(
                (event.value.poolBelow * 100) /
                    (event.value.poolAboveEq + event.value.poolBelow),
            )
        })

        return { abovePercent, belowPercent }
    },
})
</script>

<template>
    <div :class="$style.wrapper">
        <div :class="$style.head">
            <div :class="[$style.name, $style.rise]">
                <Icon name="carret" size="12" />Rise<span v-if="abovePercent">
                    {{ abovePercent }}%</span
                >
            </div>

            <div :class="[$style.name, $style.fall]">
                <span v-if="belowPercent">{{ belowPercent }}% </span>Fall
                <Icon name="carret" size="12" />
            </div>
        </div>

        <div :class="$style.pool">
            <div
                :style="{ width: `${abovePercent - 1}%` }"
                :class="[$style.fill, $style.higher]"
            />
            <div
                :style="{ width: `${belowPercent - 1}%` }"
                :class="[$style.fill, $style.lower]"
            />
        </div>
    </div>
</template>

<style module>
.wrapper {
}

.head {
    display: flex;
    align-items: center;
    justify-content: space-between;

    margin-bottom: 10px;
}

.name {
    font-size: 13px;
    line-height: 1.1;
    font-weight: 600;
    color: var(--text-secondary);

    display: flex;
    align-items: center;
    gap: 8px;
}

.name span {
    color: var(--text-tertiary);
}

.name svg {
    padding: 4px;
    border-radius: 6px;
    box-sizing: content-box;
}

.name.rise svg {
    fill: var(--green);
    background: rgba(26, 161, 104, 0.2);
}

.name.fall svg {
    fill: var(--orange);
    background: rgba(224, 92, 67, 0.2);
    transform: rotate(180deg);
}

.pool {
    position: relative;

    width: 100%;
    height: 4px;
    border-radius: 50px;
    background: var(--opacity-10);
    opacity: 0.8;
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

.fill.higher {
    left: 0;
    background: var(--green);
}

.fill.lower {
    right: 0;
    background: var(--orange);
}
</style>
