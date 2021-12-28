<script setup>
import { defineProps } from "vue"

/**
 * UI
 */
import Spin from "@/components/ui/Spin"

const props = defineProps({
    type: String,
    size: String,
    loading: Boolean,
})
</script>

<template>
    <div :class="[$style.wrapper, $style[type], $style[size]]">
        <Spin v-if="loading" size="14" />
        <Icon
            v-else
            :name="
                (type == 'warning' && 'help') ||
                (type == 'success' && 'checkcircle') ||
                (type == 'error' && 'close') ||
                (type == 'info' && 'help')
            "
            size="14"
        />

        <span><slot /> </span>
    </div>
</template>

<style module>
.wrapper {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;

    padding: 0 14px;

    min-height: 40px;
    border-radius: 8px;
}

.wrapper span {
    font-size: 12px;
    line-height: 1.6;
    font-weight: 600;
}

.wrapper.info {
    fill: var(--text-secondary);
    color: var(--text-secondary);
    background: var(--opacity-10);
}

.wrapper.warning {
    fill: var(--yellow);
    color: var(--yellow);
    background: rgba(245, 183, 43, 0.15);
}

.wrapper.success {
    fill: var(--green);
    color: var(--green);
    background: rgba(26, 161, 104, 0.15);
}

.wrapper.error {
    fill: var(--red);
    color: var(--red);
    background: rgba(224, 92, 67, 0.15);
}

.wrapper.small {
    padding: 0 10px;

    min-height: 30px;
    border-radius: 6px;
}
</style>
