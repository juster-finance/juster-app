<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue"

/**
 * UI
 */
import Spin from "@/components/ui/Spin"
import Tooltip from "@/components/ui/Tooltip"

let timerInterval = null
const timer = ref(0)

onMounted(() => {
    timerInterval = setInterval(() => {
        timer.value += 1
    }, 1000)
})

onBeforeUnmount(() => {
    clearInterval(timerInterval)
})
</script>

<template>
    <div :class="$style.wrapper">
        <div :class="$style.base">
            <Tooltip side="left">
                <div :class="$style.left">
                    <div :class="$style.spin">
                        <Spin size="14" />
                    </div>

                    <div :class="$style.name">
                        <span>Pending</span> transaction
                    </div>
                    <Icon name="help" size="14" />
                </div>

                <template v-slot:content
                    >Wait for the completion of the sent transaction to
                    continue</template
                >
            </Tooltip>

            <div :class="$style.timer">{{ timer }}<span>s</span></div>
        </div>
    </div>
</template>

<style module>
.wrapper {
    display: flex;
    justify-content: center;

    position: sticky;
    top: 80px;
    z-index: 1;
    backdrop-filter: blur(5px);

    border-bottom: 1px solid var(--border);
}

.base {
    width: 100%;
    max-width: 1250px;
    margin: 0 32px;
    height: 48px;

    display: flex;
    align-items: center;
    justify-content: space-between;
}

.left {
    display: flex;
    align-items: center;
    gap: 10px;
}

.spin {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 24px;
    height: 24px;
    border-radius: 5px;
    background: var(--opacity-05);
}

.name {
    font-size: 13px;
    line-height: 1.1;
    font-weight: 600;
    color: var(--text-secondary);
}

.name span {
    color: var(--text-primary);
}

.left svg {
    fill: var(--text-tertiary);
}

.timer {
    font-size: 12px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-secondary);
}

.timer span {
    color: var(--text-tertiary);
}

@media (max-width: 700px) {
    .base {
        margin: 0 24px;
    }
}
</style>