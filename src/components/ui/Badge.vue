<script setup>
const props = defineProps({
    size: { type: String, default: "small" },
    color: { type: String, default: "gray" },
})
</script>

<template>
    <div :class="[$style.wrapper, $style[color], $style[size]]">
        <slot />
    </div>
</template>

<style module>
.wrapper {
    display: flex;
    align-items: center;
    gap: 6px;

    border-radius: 6px;
    border: 1px solid var(--border);

    font-weight: 600;
    line-height: 1.1;
    white-space: nowrap;
}

.wrapper span {
    opacity: 0.5;
}

/**
 * Sizes
 */
.wrapper.small {
    height: 26px;
    font-size: 12px;
    padding: 0 8px;
}
.wrapper.medium {
    height: 30px;
    padding: 0 10px;
    font-size: 13px;
}

/**
 * Colors
 */

.wrapper.green {
    color: var(--green);
    fill: var(--green);
}

.wrapper.yellow {
    color: var(--yellow);
    fill: var(--yellow);
}

.wrapper.red {
    color: var(--red);
    fill: var(--red);
}

.wrapper.gray {
    color: var(--text-secondary);
    fill: var(--text-secondary);
}

.wrapper.orange {
    color: var(--orange);
    fill: var(--orange);
}
</style>
