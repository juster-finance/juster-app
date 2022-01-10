<script setup>
import { computed } from "vue"

/**
 * Utils
 */
import { f } from "@/services/utils/amounts"

/**
 * Store
 */
import { useAccountStore } from "@/store/account"

/**
 * UI
 */
import Tooltip from "@/components/ui/Tooltip"

const accountStore = useAccountStore()

const reward = computed(() => {
    const total = accountStore.wonPositions.reduce(
        (acc, curr) => (acc += curr.value),
        0,
    )

    return f(total).split(".")
})
</script>

<template>
    <router-link v-if="accountStore.wonPositions.length" to="/withdrawals">
        <Tooltip side="right">
            <div :class="$style.wrapper">
                <Icon name="crown" size="14" />

                <div :class="$style.reward">
                    <span>{{ reward[0] }}</span
                    >.{{ reward[1] }} XTZ
                </div>
            </div>

            <template #content>Available funds for withdrawal</template>
        </Tooltip>
    </router-link>
</template>

<style module>
.wrapper {
    display: flex;
    align-items: center;
    gap: 8px;

    height: 32px;
    border-radius: 8px;
    background: var(--btn-secondary-bg);

    padding: 0 12px 0 10px;

    transition: all 0.2s ease;
}

.wrapper:hover {
    background: var(--btn-secondary-bg-hover);
}

.wrapper:active {
    transform: translateY(1px);
}

.wrapper svg {
    fill: var(--green);
}

.reward {
    font-size: 12px;
    font-weight: 700;
    color: var(--text-tertiary);
}

.reward span {
    color: var(--text-primary);
}
</style>