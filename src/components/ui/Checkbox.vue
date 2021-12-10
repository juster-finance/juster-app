<script>
import { defineComponent, toRefs } from "vue"

export default defineComponent({
    name: "Checkbox",
    props: { modelValue: Boolean, forceChecked: Boolean },

    setup(props, context) {
        const { modelValue } = toRefs(props)

        const toggle = () => {
            context.emit("update:modelValue", !modelValue.value)
        }

        return { toggle }
    },
})
</script>

<template>
    <div @click="toggle" :class="$style.wrapper">
        <div
            :class="[
                $style.box,
                (modelValue && $style.active) ||
                    (forceChecked && $style.active),
            ]"
        >
            <transition name="popup">
                <Icon
                    v-if="modelValue || forceChecked"
                    name="check"
                    size="12"
                    :class="$style.check_icon"
                />
            </transition>
        </div>

        <div :class="$style.base"><slot /></div>
    </div>
</template>

<style module>
.wrapper {
    display: flex;
    align-items: center;
    gap: 8px;

    cursor: pointer;
}

.box {
    display: flex;
    align-items: center;
    justify-content: center;

    min-width: 16px;
    min-height: 16px;
    border-radius: 4px;
    fill: var(--text-primary);

    border: 1px solid var(--border);

    transition: all 0.2s ease;
}

.box.active {
    background: var(--blue);
}

.wrapper:hover .box {
    border: 1px solid var(--border-highlight);
}

.base {
    width: 100%;

    font-size: 14px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-primary);
}
</style>
