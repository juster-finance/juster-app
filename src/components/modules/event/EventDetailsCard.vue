<script setup>
/**
 * Services
 */
import { abbreviateNumber } from "@/services/utils/amounts"
import { justerLiquidityAddress } from "@/services/config"

const props = defineProps({
    event: Object,
    participants: Number,
    highestRatio: String,
})
</script>

<template>
    <div :class="$style.wrapper">
        <div :class="$style.title">Details</div>

        <div :class="$style.params">
            <div :class="$style.param">
                <span><Icon name="user" size="12" />Creator</span>

                <router-link
                    v-if="justerLiquidityAddress == event.creatorId"
                    :to="`/profile/${event.creatorId}`"
                >
                    <Icon name="logo_symbol" size="14" />{{ "Juster" }}
                </router-link>
                <router-link v-else :to="`/profile/${event.creatorId}`">
                    <img
                        :src="`https://services.tzkt.io/v1/avatars/${event.creatorId}`"
                        :class="$style.user_avatar"
                    />{{
                        `${event.creatorId.slice(
                            0,
                            4,
                        )}..${event.creatorId.slice(
                            event.creatorId.length - 4,
                            event.creatorId.length,
                        )}`
                    }}
                </router-link>
            </div>
            <div :class="$style.param">
                <span><Icon name="users" size="12" />Participants</span>
                <span>{{ participants }}</span>
            </div>
            <div :class="$style.param">
                <span><Icon name="close" size="12" />Highest ratio</span>
                <span>{{ highestRatio }}</span>
            </div>
            <div :class="$style.param">
                <span><Icon name="wallet" size="12" />Total Value</span>
                <span>{{ abbreviateNumber(event.totalValueLocked) }}</span>
            </div>
        </div>

        <div :class="$style.params">
            <div :class="$style.subtitle">LIQUIDITY</div>
            <div :class="$style.param">
                <span><Icon name="liquidity" size="12" />Provided</span>
                <span>{{ event.totalLiquidityProvided }}</span>
            </div>
            <div :class="$style.param">
                <span><Icon name="bolt" size="12" />Percent</span>
                <span>{{ event.liquidityPercent * 100 }}%</span>
            </div>
        </div>
    </div>
</template>

<style module>
.wrapper {
    border-radius: 8px;
    border: 1px solid var(--border);
    padding: 20px;
    background: var(--card-bg);
}

.title {
    display: flex;
    align-items: center;
    gap: 6px;

    font-size: 14px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-primary);
    fill: var(--opacity-40);

    margin-bottom: 20px;
}

.subtitle {
    font-size: 12px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-secondary);
}

.params {
    display: flex;
    flex-direction: column;
    gap: 20px;

    margin-bottom: 32px;
}

.params:last-child {
    margin-bottom: 0;
}

.param {
    display: flex;
    justify-content: space-between;

    font-size: 14px;
    line-height: 1;
    font-weight: 600;
}

.param span:nth-child(1) {
    color: var(--text-tertiary);

    display: flex;
    align-items: center;
    gap: 6px;
    fill: var(--opacity-40);
}

.param span:nth-child(2) {
    display: flex;
    align-items: center;
    gap: 6px;

    color: var(--text-primary);
}

.param span:nth-child(2) svg {
    fill: var(--text-tertiary);
}

.param span:nth-child(2) img {
    width: 14px;
    height: 14px;
}

.param a {
    display: flex;
    align-items: center;
    gap: 6px;

    color: var(--text-primary);
}

.param a svg {
    fill: var(--text-tertiary);
}

.param a img {
    width: 14px;
    height: 14px;
}
</style>
