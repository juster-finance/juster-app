<template>
    <div :class="$style.wrapper">
        <slot />
    </div>
</template>

<style module>
.wrapper {
    display: flex;
    align-items: center;

    font-size: 12px;
    font-weight: 600;
    color: var(--text-tertiary);

    padding: 0 16px;
    height: 24px;

    margin-bottom: 4px;
}
</style>