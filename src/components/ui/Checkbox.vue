<script>
import { defineComponent, toRefs } from "vue"

export default defineComponent({
    name: "Checkbox",
    props: { modelValue: Boolean },

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
        <div :class="[$style.box, modelValue && $style.active]">
            <transition name="popup">
                <Icon
                    v-if="modelValue"
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

    width: 16px;
    height: 16px;
    border-radius: 5px;
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
    font-size: 14px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-primary);
}

.base span {
    color: var(--text-tertiary);
}
</style>
