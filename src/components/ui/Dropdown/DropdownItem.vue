<script>
import { defineComponent } from "vue"

export default defineComponent({
    name: "DropdownItem",
    props: {
        disabled: Boolean,
    },
})
</script>

<template>
    <div :class="[$style.wrapper, disabled && $style.disabled]">
        <slot />
    </div>
</template>

<style module>
.wrapper {
    display: flex;
    align-items: center;

    min-width: 120px;
    height: 32px;
    padding: 0 16px 0 8px;
    margin: 0 8px;
    border-radius: 6px;

    font-size: 13px;
    line-height: 1.1;
    font-weight: 500;
    color: var(--text-primary);
    white-space: nowrap;

    cursor: pointer;

    transition: background 0.2s ease;
}

.wrapper.disabled {
    opacity: 0.5;
    pointer-events: none;
}

.wrapper svg {
    fill: var(--opacity-40);

    margin-right: 10px;
}

.wrapper:hover {
    background: var(--opacity-05);
}
</style>
