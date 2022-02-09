<script setup>
import { ref } from "vue"

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
})
const emit = defineEmits(["update:modelValue"])

const toggle = () => {
    if (props.disabled) return

    emit("update:modelValue", !props.modelValue)
}
</script>

<template>
    <div @click="toggle" :class="[$style.wrapper, modelValue && $style.active]">
        <div
            v-if="!disabled"
            :class="[$style.slider, modelValue && $style.active]"
        />

        <div v-else :class="$style.lock">
            <Icon name="lock" size="12" />
        </div>
    </div>
</template>

<style module>
.wrapper {
    position: relative;

    width: 32px;
    height: 20px;

    background: var(--toggle-bg);
    border-radius: 50px;
    cursor: pointer;

    transition: background 0.2s ease;
}

.slider {
    position: absolute;
    top: 4px;
    left: 4px;

    width: 12px;
    height: 12px;

    background: rgba(255, 255, 255, 0.9);
    border-radius: 50px;

    transition: all 0.1s ease;
}

.lock {
    display: flex;
    align-items: center;
    justify-content: center;

    height: 100%;

    cursor: not-allowed;
}

.lock svg {
    fill: var(--text-secondary);
}

.wrapper.active {
    background: var(--blue);
}

.wrapper.active .slider {
    left: 16px;
}

.wrapper:active .slider {
    width: 14px;
}

.wrapper.active:active .slider {
    width: 12px;
}
</style>