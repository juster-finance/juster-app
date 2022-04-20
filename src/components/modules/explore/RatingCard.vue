<script setup>
/**
 * Utils
 */
import { abbreviateNumber } from "@/services/utils/amounts"

const props = defineProps({
    users: { type: Array, default: [] },
    suffix: { type: String },
})

const shorten = (address) => {
    return [
        address.slice(0, 5),
        address.slice(address.length - 4, address.length),
    ]
}
</script>

<template>
    <div :class="$style.wrapper">
        <router-link
            v-for="(user, index) in users"
            :key="user.address"
            :to="`/profile/${user.address}`"
            :class="$style.user"
        >
            <div :class="$style.position">
                <Icon v-if="index === 0" name="crown" size="14" />
                {{ index + 1 }}
            </div>

            <img
                :src="`https://services.tzkt.io/v1/avatars/${user.address}`"
                :class="$style.avatar"
                alt="avatar"
            />

            <div :class="$style.username">
                {{ shorten(user.address)[0] }}<span>...</span
                >{{ shorten(user.address)[1] }}
            </div>

            <div :class="$style.amount">
                <span>{{ abbreviateNumber(user.value) }}</span>
                {{ suffix }}
            </div>

            <div v-if="index !== users.length - 1" :class="$style.separator">
                /
            </div>
        </router-link>
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

.user {
    display: flex;
    align-items: center;

    flex: 1;
}

.user:last-child {
    flex: 0;
}

.position {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    min-width: 24px;
    min-height: 24px;
    background: var(--opacity-05);
    border-radius: 6px;

    font-size: 12px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-primary);

    margin-right: 8px;
}

.position svg {
    position: absolute;
    top: -4px;
    right: -4px;

    fill: var(--green);
}

.avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;

    margin-right: 8px;
}

.username {
    font-size: 13px;
    line-height: 14px;
    font-weight: 600;
    color: var(--text-primary);

    margin-right: 8px;
}

.username span {
    color: var(--text-tertiary);
}

.amount {
    font-size: 13px;
    line-height: 14px;
    font-weight: 500;
    color: var(--text-tertiary);
    white-space: nowrap;
}

.amount span {
    font-weight: 600;
}

.separator {
    font-size: 14px;
    line-height: 1;
    font-weight: 500;
    color: var(--opacity-10);
    text-align: center;

    flex: 1;
    margin: 0 8px;
}

@media (max-width: 1250px) {
    .wrapper {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;

        padding-right: 0;
        padding-left: 0;
    }

    .user {
        width: 100%;
        padding: 0 8px 8px 8px;

        border-bottom: 1px solid var(--border);
    }

    .user:last-child {
        padding-bottom: 0;

        border-bottom: initial;
    }

    .amount {
        flex: 1;
        text-align: right;
    }

    .separator {
        display: none;
    }
}

@media (max-width: 300px) {
    .amount {
        display: none;
    }
}
</style>