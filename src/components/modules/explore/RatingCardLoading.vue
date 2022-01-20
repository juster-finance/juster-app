<script setup>
</script>

<template>
    <div :class="$style.wrapper">
        <div v-for="index in 5" :key="index" :class="$style.user">
            <div :class="$style.position" />

            <div :class="$style.avatar" />

            <div :class="$style.address" />

            <div :class="$style.amount" />
        </div>
    </div>
</template>

<style module>
.wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;

    background: var(--card-bg);
    border-radius: 8px;
    border: 1px solid var(--border);
    min-height: 42px;

    padding: 8px 24px 8px 8px;
}

@keyframes mig {
    0% {
        background: #2d2d2d;
    }
    50% {
        background: #555555;
    }
    100% {
        background: #2d2d2d;
    }
}

.user {
    display: flex;
    align-items: center;
    gap: 8px;
}

.position {
    min-width: 24px;
    min-height: 24px;
    background: var(--opacity-05);
    border-radius: 6px;

    animation: mig 2s infinite;
}

.avatar {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--opacity-05);

    animation: mig 2s infinite;
}

.address {
    width: 80px;
    height: 12px;
    border-radius: 50px;
    background: var(--opacity-05);

    animation: mig 2s infinite;
}

.amount {
    width: 55px;
    height: 12px;
    border-radius: 50px;
    background: var(--opacity-05);

    animation: mig 2s infinite;
}
</style>