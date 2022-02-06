<script setup>
import { computed } from "vue"
import { DateTime } from "luxon"

/**
 * UI
 */
import Tooltip from "@/components/ui/Tooltip"

/**
 * Local
 */
import EventActions from "@/components/local/EventActions"

/**
 * Services
 */
import { currentNetwork } from "@/services/sdk"
import { supportedMarkets, verifiedMakers } from "@/services/config"

const props = defineProps({
    event: {
        type: Object,
        required: true,
    },
    startCountdown: {
        type: String,
    },
    finishCountdown: {
        type: String,
    },
    startStatus: {
        type: String,
        required: true,
    },
    finishStatus: {
        type: String,
        required: true,
    },
    price: {
        type: Object,
    },
    won: {
        type: Boolean,
    },
    positionForWithdraw: {
        type: Object,
    },
    isWithdrawing: {
        type: Boolean,
    },
})
const emit = defineEmits(["openParticipants", "onBet", "onWithdraw"])

const symbol = computed(() => props.event.currencyPair.symbol)

const participantsAvatars = computed(() => {
    let avatars = [
        ...props.event.bets.map((bet) => bet.userId),
        ...props.event.deposits.map((deposit) => deposit.userId),
    ]

    /** remove duplicates */
    avatars = [...new Set(avatars)]

    return avatars
})

const timing = computed(() => {
    const eventDt = DateTime.fromISO(props.event.betsCloseTime).setLocale("ru")

    const endDt = eventDt.plus(props.event.measurePeriod * 1000)

    return {
        start: {
            time: eventDt.toLocaleString({
                hour: "numeric",
                minute: "numeric",
            }),
            day: eventDt.toLocaleString({
                day: "numeric",
                month: "short",
            }),
        },
        end: {
            time: endDt.toLocaleString({
                hour: "numeric",
                minute: "numeric",
            }),
            day: endDt.toLocaleString({
                day: "numeric",
                month: "short",
            }),
        },
        showDay: eventDt.ordinal < endDt.ordinal,
    }
})

const priceDynamics = computed(() => {
    const startRate = props.event.startRate * 100
    const closedRate = props.event.closedRate * 100

    const percent =
        props.event.status == "FINISHED"
            ? (100 * Math.abs(closedRate - startRate)) /
              ((closedRate + startRate) / 2)
            : (100 * Math.abs(props.price.rate - startRate)) /
              ((props.price.rate + startRate) / 2)

    const diff =
        props.event.status == "FINISHED"
            ? closedRate - startRate
            : props.price.rate - startRate

    return { diff, percent }
})
</script>

<template>
    <div :class="$style.wrapper">
        <div :class="$style.header">
            <div :class="$style.title">
                <img
                    v-if="event.winnerBets == 'ABOVE_EQ'"
                    :src="require('@/assets/icons/higher_won.svg')"
                />
                <img
                    v-else-if="event.winnerBets == 'BELOW'"
                    :src="require('@/assets/icons/lower_won.svg')"
                />
                <Icon v-else name="sides" size="16" />
                {{
                    supportedMarkets[symbol] && supportedMarkets[symbol].target
                }}
                <span>price event</span>
            </div>

            <div :class="$style.users">
                <Tooltip position="bottom" side="right">
                    <div
                        @click="emit('openParticipants')"
                        :class="$style.participants"
                    >
                        <img
                            v-for="participantAvatar in participantsAvatars.slice(
                                0,
                                3,
                            )"
                            :key="participantAvatar"
                            :src="`https://services.tzkt.io/v1/avatars/${participantAvatar}`"
                            :class="[$style.user_avatar, $style.participant]"
                        />
                    </div>

                    <template v-slot:content
                        >Participants ({{
                            participantsAvatars.length
                        }})</template
                    >
                </Tooltip>

                <Tooltip position="bottom" side="right">
                    <div :class="$style.creator">
                        <template
                            v-if="
                                event.creatorId ==
                                verifiedMakers[currentNetwork]
                            "
                        >
                            <Icon name="logo_symbol" size="24" />
                            <Icon
                                name="verified"
                                size="16"
                                :class="$style.verified_icon"
                            />
                        </template>

                        <template v-else>
                            <img
                                :src="`https://services.tzkt.io/v1/avatars/${event.creatorId}`"
                                :class="$style.user_avatar"
                            />
                        </template>
                    </div>

                    <template v-slot:content>{{
                        event.creatorId == verifiedMakers[currentNetwork]
                            ? "Recurring event from Juster"
                            : "Custom event from user"
                    }}</template>
                </Tooltip>
            </div>
        </div>

        <div :class="$style.status">
            <!-- New -->
            <template
                v-if="startStatus == 'In progress' && event.status == 'NEW'"
            >
                <Icon
                    name="event_new"
                    size="14"
                    :style="{ fill: `var(--green)` }"
                />

                <div :class="$style.status__info">
                    <span>New</span>
                    <span>Open for betting & providing liquidity</span>
                </div>
            </template>

            <!-- Starting -->
            <template
                v-else-if="startStatus == 'Finished' && event.status == 'NEW'"
            >
                <Icon
                    name="event_new"
                    size="14"
                    :style="{ fill: `var(--yellow)` }"
                />

                <div :class="$style.status__info">
                    <span>Starting</span>
                    <span>The event is starting soon</span>
                </div>
            </template>

            <!-- Active -->
            <template
                v-else-if="
                    startStatus == 'Finished' && event.status == 'STARTED'
                "
            >
                <Icon
                    name="event_active"
                    size="14"
                    :style="{ fill: `var(--yellow)` }"
                />

                <div :class="$style.status__info">
                    <span>Active</span>
                    <span>Closed for betting, watching the price</span>
                </div>
            </template>

            <!-- Finished -->
            <template
                v-else-if="
                    startStatus == 'Finished' && event.status == 'FINISHED'
                "
            >
                <Icon
                    name="event_finished"
                    size="14"
                    :style="{ fill: `var(--green)` }"
                />

                <div :class="$style.status__info">
                    <span>Finished</span>
                    <span>The event is over, winning side determined</span>
                </div>
            </template>

            <!-- Finished -->
            <template v-else-if="event.status == 'CANCELED'">
                <Icon
                    name="stop"
                    size="14"
                    :style="{ fill: `var(--text-secondary)` }"
                />

                <div :class="$style.status__info">
                    <span>Canceled</span>
                    <span>Due to lack of participants, liquidity refund</span>
                </div>
            </template>
        </div>

        <div :class="$style.period">
            <div :class="$style.period__dates">
                <div
                    :class="[
                        $style.period__date,
                        ['STARTED', 'FINISHED'].includes(event.status) &&
                            $style.opacity,
                    ]"
                >
                    <Icon name="calendar" size="14" />

                    <div>
                        {{ timing.start.time
                        }}<span>, {{ timing.start.day }}</span>
                    </div>
                </div>

                <div
                    :class="[
                        $style.dot,
                        event.status == 'STARTED' && $style.mig,
                    ]"
                />
                <div
                    :class="[
                        $style.dot,
                        event.status == 'STARTED' && $style.mig,
                    ]"
                />

                <span :class="$style.period__duration"
                    >{{
                        (event.measurePeriod / 3600) % 1 == 0
                            ? event.measurePeriod / 3600
                            : (event.measurePeriod / 3600).toFixed(2)
                    }}h</span
                >

                <div
                    :class="[
                        $style.dot,
                        event.status == 'STARTED' && $style.mig,
                    ]"
                />
                <div
                    :class="[
                        $style.dot,
                        event.status == 'STARTED' && $style.mig,
                    ]"
                />

                <div
                    :class="[
                        $style.period__date,
                        event.status == 'FINISHED' && $style.opacity,
                    ]"
                >
                    <Icon name="calendar" size="14" />

                    <div>
                        {{ timing.end.time }}<span>, {{ timing.end.day }}</span>
                    </div>
                </div>
            </div>

            <div :class="$style.period__labels">
                <span>Start</span>
                <span>Due to</span>
            </div>
        </div>

        <div :class="$style.params">
            <!-- First Param -->
            <!-- *New/Starting* -->
            <div
                v-if="
                    ['In progress', 'Finished'].includes(startStatus) &&
                    event.status == 'NEW'
                "
                :class="$style.param"
            >
                <span><Icon name="time" size="12" />Start In</span>

                <span v-if="startStatus == 'In progress'">{{
                    startCountdown
                }}</span>
                <span v-else-if="startStatus == 'Finished'">Soon</span>
            </div>

            <!-- *Active* -->
            <div
                v-else-if="
                    startStatus == 'Finished' && event.status == 'STARTED'
                "
                :class="$style.param"
            >
                <span><Icon name="time" size="12" />Finish In</span>

                <span v-if="finishStatus == 'In progress'">{{
                    finishCountdown
                }}</span>
                <span v-else-if="finishStatus == 'Finished'">Soon</span>
            </div>

            <!-- *Finished* -->
            <div
                v-else-if="
                    startStatus == 'Finished' && event.status == 'FINISHED'
                "
                :class="$style.param"
            >
                <span><Icon name="time" size="12" />Won Side</span>

                <span
                    :class="
                        priceDynamics.diff > 0
                            ? $style.green_icon
                            : $style.red_icon
                    "
                    ><Icon name="higher" size="12" />{{
                        event.winnerBets == "ABOVE_EQ" ? "Up" : "Down"
                    }}</span
                >
            </div>

            <!-- *Canceled* -->
            <div v-else-if="event.status == 'CANCELED'" :class="$style.param">
                <span><Icon name="time" size="12" />Won Side</span>

                <span>Draw</span>
            </div>

            <!-- Second Param -->
            <!-- *New/Starting* -->
            <div
                v-if="
                    ['In progress', 'Finished'].includes(startStatus) &&
                    event.status == 'NEW'
                "
                :class="$style.param"
            >
                <span><Icon name="sides" size="12" />Target Dynamics</span>

                <span>
                    <Icon
                        :name="
                            (event.targetDynamics == 1 && 'checkcircle') ||
                            ([1.05, 0.95].includes(event.targetDynamics) &&
                                'warning') ||
                            'warning'
                        "
                        size="12"
                        :style="{
                            fill: `var(--${
                                (event.targetDynamics == 1 && 'green') ||
                                ([1.05, 0.95].includes(event.targetDynamics) &&
                                    'yellow') ||
                                'red'
                            })`,
                        }"
                    />

                    {{ event.targetDynamics * 100 }}%</span
                >
            </div>

            <!-- *Active/Finished* -->
            <div
                v-if="
                    startStatus == 'Finished' &&
                    ['STARTED', 'FINISHED'].includes(event.status)
                "
                :class="$style.param"
            >
                <span>
                    <img
                        v-if="event.winnerBets == 'ABOVE_EQ'"
                        :src="require('@/assets/icons/higher_won.svg')"
                    />
                    <img
                        v-else-if="event.winnerBets == 'BELOW'"
                        :src="require('@/assets/icons/lower_won.svg')"
                    />
                    <Icon v-else name="sides" size="12" />
                    Price Dynamics</span
                >

                <span
                    v-if="priceDynamics.diff"
                    :class="
                        priceDynamics.diff > 0
                            ? $style.green_full
                            : $style.red_full
                    "
                    ><Icon name="carret" size="12" />{{
                        Math.abs(priceDynamics.diff).toFixed(2)
                    }}
                    ({{ priceDynamics.percent.toFixed(2) }}%)</span
                >
                <span v-else> 0.00 (0.00%) </span>
            </div>

            <!-- *Canceled* -->
            <div v-if="event.status == 'CANCELED'" :class="$style.param">
                <span>
                    <Icon name="sides" size="12" />
                    Price Dynamics</span
                >

                <span> 0.00 (0.00%) </span>
            </div>
        </div>

        <EventActions
            primary
            @onBet="(target) => emit('onBet', target)"
            @onWithdraw="emit('onWithdraw')"
            :event="event"
            :won="won"
            :wonPosition="positionForWithdraw"
            :disabled="
                event.totalLiquidityProvided == 0 || startStatus == 'Finished'
            "
            :isWithdrawing="isWithdrawing"
            :class="$style.event_actions"
        />
    </div>
</template>

<style module>
.wrapper {
    border-radius: 8px;
    border: 1px solid var(--border);
    padding: 20px;
    background: var(--card-bg);
}

.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.title {
    display: flex;
    align-items: center;

    height: 20px;

    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
}

.title img {
    display: flex;

    width: 16px;
    height: 16px;

    margin-right: 6px;
}

.title svg {
    display: flex;

    fill: var(--text-tertiary);

    margin-right: 6px;
}

.title span {
    color: var(--text-tertiary);

    margin-left: 4px;
}

.users {
    display: flex;
    align-items: center;
    gap: 8px;
}

.participants {
    display: flex;
}

.participant {
    margin-left: -12px;
}

.creator {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;

    fill: var(--text-secondary);

    width: 30px;
    height: 30px;
}

.verified_icon {
    fill: var(--orange);
    background: var(--card-bg);
    border-radius: 50%;

    position: absolute;
    top: -4px;
    right: -4px;
    box-sizing: content-box;
}

.user_avatar {
    width: 30px;
    height: 30px;

    background: rgb(35, 35, 35);
    border-radius: 50px;

    padding: 2px;
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

.dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
}

.dot.mig {
    animation: mig 2s infinite;
}

/* Status card */
.status {
    display: flex;
    gap: 8px;

    border-radius: 6px;
    background: var(--opacity-05);
    padding: 12px 12px 14px 12px;

    margin-top: 20px;
}

.status__info {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.status__info span:nth-child(1) {
    font-size: 14px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-secondary);
}

.status__info span:nth-child(2) {
    font-size: 13px;
    line-height: 1.1;
    font-weight: 500;
    color: var(--text-tertiary);
}

/* Period */
.period {
    display: flex;
    flex-direction: column;
    gap: 8px;

    margin-top: 20px;
}

.period__dates {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.period__date {
    display: flex;
    align-items: center;
    gap: 8px;

    height: 32px;
    padding: 0 8px;
    border-radius: 6px;
    background: var(--opacity-05);

    transition: opacity 0.2s ease;
}

.period__date.opacity {
    opacity: 0.5;
}

.period__date:hover {
    opacity: 1;
}

.period__date svg {
    fill: var(--text-tertiary);
}

.period__date div {
    font-size: 13px;
    line-height: 1.1;
    font-weight: 600;
    color: var(--text-primary);
}

.period__date div span {
    color: var(--text-tertiary);
}

.period__duration {
    font-size: 12px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-tertiary);
}

.period__labels {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.period__labels span {
    font-size: 12px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-tertiary);
}

/* Params */
.params {
    display: flex;
    flex-direction: column;
    gap: 20px;

    margin-top: 32px;
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

    color: var(--text-secondary);
}

.param span:nth-child(2).green_full {
    color: var(--green);
    fill: var(--green);
}

.param span:nth-child(2).red_full {
    color: var(--red);
    fill: var(--red);
}

.param span:nth-child(2).green_icon {
    fill: var(--green);
}

.param span:nth-child(2).red_icon {
    fill: var(--red);
}

.param span:nth-child(2).red_icon svg,
.param span:nth-child(2).red_full svg {
    transform: rotate(180deg);
}

.param span:nth-child(1) img {
    width: 12px;
}

.event_actions {
    margin-top: 24px;
}
</style>