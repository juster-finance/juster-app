<script>
export default {
    name: "Badge",
    props: { color: String },
}
</script>

<template>
    <div :class="[$style.wrapper, $style[color]]">
        <slot />
    </div>
</template>

<style module>
.wrapper {
    display: flex;
    align-items: center;
    gap: 6px;

    height: 26px;
    border-radius: 6px;
    border: 1px solid var(--border);

    font-size: 12px;
    font-weight: 600;
    line-height: 1;
    white-space: nowrap;

    padding: 0 8px;
}

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
