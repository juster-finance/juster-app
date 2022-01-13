<script>
import { computed, defineComponent, toRefs } from "vue"
import { DateTime } from "luxon"

/**
 * UI
 */
import Spin from "@/components/ui/Spin"

/**
 * Store
 */
import { useAccountStore } from "@/store/account"

export default defineComponent({
    name: "BetCard",
    props: { bet: Object, pending: Boolean, event: Object },

    setup(props) {
        const { bet, event } = toRefs(props)

        const accountStore = useAccountStore()

        const side = computed(() =>
            bet.value.side == "ABOVE_EQ" ? "Up" : "Down",
        )

        const isWon = computed(() => bet.value.side == event.value?.winnerBets)

        return { isWon, side, DateTime, pkh: accountStore.pkh }
    },

    components: { Spin },
})
</script>

<template>
    <div :class="$style.wrapper">
        <div :class="$style.base">
            <div :class="[$style.icon, isWon && $style.won]">
                <Icon
                    v-if="!pending"
                    :name="isWon ? 'checkcircle' : 'bet'"
                    size="16"
                />
                <Spin v-else size="16" />

                <router-link
                    :to="`/profile/${bet.userId}`"
                    :class="$style.user_avatar"
                >
                    <img
                        :src="`https://services.tzkt.io/v1/avatars/${
                            pending ? pkh : bet.userId
                        }`"
                    />
                </router-link>
            </div>

            <div :class="$style.info">
                <div v-if="!pending" :class="$style.title">
                    {{ pkh == bet.userId ? "My" : "" }} Bet
                </div>
                <div v-else :class="$style.title">Pending Bet</div>

                <div v-if="!pending" :class="$style.time">
                    {{ DateTime.fromISO(bet.createdTime).toRelative() }}
                </div>
                <div v-else :class="$style.time">Just now</div>
            </div>
        </div>

        <div :class="[$style.param, side == 'Up' ? $style.up : $style.down]">
            <Icon name="higher" size="12" />{{ side }}
        </div>

        <div :class="$style.param">{{ bet.amount }}&nbsp;<span>XTZ</span></div>

        <div v-if="event && event.status == 'CANCELED'" :class="$style.param">
            {{ bet.amount }}&nbsp;<span>XTZ</span>
        </div>
        <div v-else :class="$style.param">
            {{ isWon ? bet.reward.toFixed(2) : 0 }}&nbsp;<span>XTZ</span>
        </div>
    </div>
</template>

<style module>
.wrapper {
    display: flex;
    align-items: center;

    height: 60px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--card-bg);
    padding: 0 16px;

    transition: border 0.2s ease;
}

.wrapper:hover {
    border: 1px solid var(--border-highlight);
}

.base {
    display: flex;
    align-items: center;
    flex: 2;
}

.icon {
    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: var(--opacity-05);
    fill: var(--icon);

    margin-right: 16px;
}

.icon.won {
    fill: var(--green);
}

.user_avatar img {
    position: absolute;
    top: -8px;
    right: -8px;

    width: 20px;
    height: 20px;
    background: var(--card-bg);
    border-radius: 50%;
}

.info {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.title {
    font-size: 14px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-primary);
}

.time {
    font-size: 12px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-tertiary);
}

.param {
    display: flex;
    align-items: center;

    font-size: 14px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-primary);

    flex: 1;
}

.param.up {
    fill: var(--green);
}

.param.down {
    fill: var(--red);
}

.param.down svg {
    transform: rotate(180deg);
}

.param svg {
    margin-right: 6px;
}

.param span {
    color: var(--text-tertiary);
}
</style>
