<script>
import {
    defineComponent,
    onMounted,
    onBeforeUnmount,
    onUnmounted,
    toRefs,
    ref,
    reactive,
    computed,
    inject,
} from "vue"
import { DateTime } from "luxon"
import { gql } from "@/services/tools"

/**
 * UI
 */
import {
    Dropdown,
    DropdownItem,
    DropdownDivider,
} from "@/components/ui/Dropdown"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import Tooltip from "@/components/ui/Tooltip"

/**
 * Local
 */
import ParticipantsModal from "@/components/local/modals/ParticipantsModal"
import LiquidityModal from "@/components/local/modals/position/LiquidityModal"
import BetModal from "@/components/local/modals/position/BetModal"
import EventActions from "@/components/local/EventActions"

/**
 * Services
 */
import {
    toClipboard,
    getCurrencyIcon,
    capitalizeFirstLetter,
} from "@/services/utils/global"
import { juster } from "@/services/tools"
import { abbreviateNumber } from "@/services/utils/amounts"
import { supportedMarkets, verifiedMakers } from "@/services/config"

/**
 * Composable
 */
import { useCountdown } from "@/composable/date"
import { useMarket } from "@/composable/market"

/**
 * Store
 */
import { useMarketStore } from "@/store/market"
import { useAccountStore } from "@/store/account"
import { useNotificationsStore } from "@/store/notifications"

export default defineComponent({
    name: "EventCard",
    props: {
        event: Object,
        chart: Boolean,
    },

    setup(props) {
        const { event } = toRefs(props)

        const amplitude = inject("amplitude")

        /** Stores */
        const notificationsStore = useNotificationsStore()
        const accountStore = useAccountStore()
        const marketStore = useMarketStore()

        const { updateWithdrawals } = useMarket()

        const card = ref(null)
        const openContextMenu = ref(false)

        /** Bet modal */
        const showBetModal = ref(false)
        const preselectedSide = ref("Rise")

        /** Liquidity modal */
        const showLiquidityModal = ref(false)

        /** Participants modal */
        const showParticipantsModal = ref(false)

        const subscription = ref({})

        const symbol = computed(() => event.value.currencyPair.symbol)

        /** Countdown setup: Time to start */
        const startDt = computed(() =>
            new Date(event.value?.betsCloseTime).getTime(),
        )
        const {
            status: startStatus,
            time: startTime,
            stop: destroyStartCountdown,
        } = useCountdown(startDt)

        // eslint-disable-next-line vue/return-in-computed-property
        const timeToStart = computed(() => {
            if (startTime.h > 0) {
                return {
                    num: startTime.h,
                    suffix: startTime.h > 1 ? "hours" : "hour",
                }
            }
            if (startTime.h == 0) {
                return {
                    num: startTime.m,
                    suffix: startTime.m > 1 ? "mins" : "min",
                }
            }
        })

        /** Countdown setup: Time to finish */
        const finishDt = computed(() =>
            DateTime.fromISO(event.value.betsCloseTime)
                .plus({ second: event.value.measurePeriod })
                .toJSDate()
                .getTime(),
        )
        const {
            status: finishStatus,
            time: finishTime,
            stop: destroyFinishCountdown,
        } = useCountdown(finishDt)

        // eslint-disable-next-line vue/return-in-computed-property
        const timeToFinish = computed(() => {
            if (finishTime.h > 0) {
                return {
                    num: finishTime.h,
                    suffix: finishTime.h > 1 ? "hours" : "hour",
                }
            }
            if (finishTime.h == 0) {
                return {
                    num: finishTime.m,
                    suffix: finishTime.m > 1 ? "mins" : "min",
                }
            }
        })

        const percentage = computed(() => {
            return event.value?.targetDynamics * 100 - 100
        })

        const timing = computed(() => {
            const eventDt = DateTime.fromISO(
                event.value.betsCloseTime,
            ).setLocale("ru")

            const endDt = eventDt.plus(event.value.measurePeriod * 1000)

            return {
                start: {
                    time: eventDt.toLocaleString({
                        hour: "numeric",
                        minute: "numeric",
                    }),
                    day: eventDt.toLocaleString({
                        day: "numeric",
                    }),
                    month: eventDt.toLocaleString({ month: "short" }),
                },
                end: {
                    time: endDt.toLocaleString({
                        hour: "numeric",
                        minute: "numeric",
                    }),
                    day: endDt.toLocaleString({
                        day: "numeric",
                    }),
                    month: endDt.toLocaleString({ month: "short" }),
                },
                showDay: eventDt.ordinal < endDt.ordinal,
            }
        })

        const liquidityLevel = computed(() => {
            if (event.value.totalLiquidityProvided < 1000) return "Low"
            if (event.value.totalLiquidityProvided == 1000) return "Medium"
            if (event.value.totalLiquidityProvided > 1000) return "High"
            if (event.value.totalLiquidityProvided > 5000) return "Super"
        })

        const participantsAvatars = computed(() => {
            let avatars = [
                ...event.value.bets.map((bet) => bet.userId),
                ...event.value.deposits.map((deposit) => deposit.userId),
            ]

            /** remove duplicates */
            avatars = [...new Set(avatars)]

            return avatars
        })

        const userTVL = computed(() => {
            let tvl = 0

            tvl += event.value.deposits
                .filter((deposit) => deposit.userId == accountStore.pkh)
                .reduce((a, { amountBelow }) => a + amountBelow, 0)
            tvl += event.value.bets
                .filter((bet) => bet.userId == accountStore.pkh)
                .reduce((a, { amount }) => a + amount, 0)

            return tvl
        })

        /** Win & Withdraw */
        const won = computed(() => {
            if (!event.value) return

            return !!event.value.bets
                .filter((bet) => bet.userId == accountStore.pkh)
                .filter((bet) => bet.side == event.value.winnerBets).length
        })
        const positionForWithdraw = computed(() => {
            return accountStore.wonPositions.find(
                (position) => position.event.id == event.value.id,
            )
        })

        /** Join to the event & Liquidity */
        const handleBet = (target) => {
            preselectedSide.value = capitalizeFirstLetter(target)

            /** disable Bet / Liquidity right after betsCloseTime */
            if (
                startStatus.value == "Finished" ||
                event.value.totalLiquidityProvided == 0
            )
                return

            amplitude.logEvent("showBetModal", { where: "event_card" })

            showBetModal.value = true
        }

        /** Withdraw */
        const isWithdrawing = ref(false)
        const handleWithdraw = (e) => {
            isWithdrawing.value = true

            amplitude.logEvent("clickWithdraw", { where: "event_card" })

            juster
                .withdraw(event.value.id, accountStore.pkh)
                .then((op) => {
                    /** Pending transaction label */
                    accountStore.pendingTransaction.awaiting = true

                    op.confirmation()
                        .then((result) => {
                            accountStore.pendingTransaction.awaiting = false
                            isWithdrawing.value = false

                            /** rm won position from store */
                            accountStore.positionsForWithdrawal =
                                accountStore.positionsForWithdrawal.filter(
                                    (position) =>
                                        position.event.id != event.value.id,
                                )

                            updateWithdrawals()

                            if (!result.completed) {
                                // todo: handle it?
                            }
                        })
                        .catch((err) => {
                            accountStore.pendingTransaction.awaiting = false
                            isWithdrawing.value = false
                        })

                    notificationsStore.create({
                        notification: {
                            type: "success",
                            title: "Withdrawal request sent",
                            description:
                                "Processing takes about 10-30 seconds. Funds will appear in your wallet soon",
                            autoDestroy: true,
                        },
                    })

                    amplitude.logEvent("onWithdraw", {
                        eventId: event.value.id,
                    })
                })
                .catch((err) => {
                    accountStore.pendingTransaction.awaiting = false
                    isWithdrawing.value = false
                })
        }

        const handleParticipants = () => {
            showParticipantsModal.value = true

            amplitude.logEvent("showParticipantsModal", { where: "event_card" })
        }

        const copy = (target) => {
            if (target == "id") {
                notificationsStore.create({
                    notification: {
                        type: "success",
                        title: "Event ID copied to clipboard",
                        description: "Use Ctrl+V to paste",
                        autoDestroy: true,
                    },
                })

                toClipboard(event.value.id)
            }
            if (target == "url") {
                notificationsStore.create({
                    notification: {
                        type: "success",
                        title: "Event URL copied to clipboard",
                        description: "Use Ctrl+V to paste",
                        autoDestroy: true,
                    },
                })

                toClipboard(location)
            }
        }

        /** Context menu */
        const contextMenuStyles = reactive({
            top: 0,
            left: 0,
        })
        const contextMenuHandler = (e) => {
            e.preventDefault()

            amplitude.logEvent("showContextMenu")

            contextMenuStyles.top = `${e.clientY}px`
            contextMenuStyles.left = `${e.clientX}px`

            openContextMenu.value = !openContextMenu.value
        }

        onMounted(async () => {
            card.value.addEventListener("contextmenu", contextMenuHandler)

            if (event.value.status === "FINISHED") return

            /** Subscription, TODO: refactor */
            subscription.value = await gql
                .subscription({
                    event: [
                        {
                            where: { id: { _eq: event.value.id } },
                        },
                        {
                            id: true,
                            poolAboveEq: true,
                            poolBelow: true,
                            totalLiquidityShares: true,
                            totalValueLocked: true,
                            totalLiquidityProvided: true,
                            createdTime: true,
                            creatorId: true,
                            betsCloseTime: true,
                            liquidityPercent: true,
                            status: true,
                            startRate: true,
                            closedRate: true,
                            winnerBets: true,
                            bets: {
                                id: true,
                                side: true,
                                reward: true,
                                amount: true,
                                createdTime: true,
                                userId: true,
                            },
                            deposits: {
                                amountAboveEq: true,
                                amountBelow: true,
                                eventId: true,
                                id: true,
                                userId: true,
                                createdTime: true,
                                shares: true,
                            },
                        },
                    ],
                })
                .subscribe({
                    next: (data) => {
                        const { event: newEvent } = data

                        marketStore.updEvent(newEvent[0])
                    },
                    error: console.error,
                })
        })

        onBeforeUnmount(() => {
            card.value.removeEventListener("contextmenu", contextMenuHandler)
        })

        onUnmounted(() => {
            if (
                subscription.value.hasOwnProperty("_state") &&
                !subscription.value?.closed
            ) {
                subscription.value.unsubscribe()
            }

            destroyStartCountdown()
            destroyFinishCountdown()
        })

        return {
            DateTime,
            accountStore,
            card,
            openContextMenu,
            contextMenuStyles,
            showBetModal,
            preselectedSide,
            showLiquidityModal,
            showParticipantsModal,
            event,
            timing,
            timeToStart,
            startStatus,
            timeToFinish,
            finishStatus,
            symbol,
            liquidityLevel,
            participantsAvatars,
            userTVL,
            won,
            positionForWithdraw,
            percentage,
            handleBet,
            handleParticipants,
            isWithdrawing,
            handleWithdraw,
            copy,
            getCurrencyIcon,
            abbreviateNumber,
            supportedMarkets,
            verifiedMakers,
        }
    },

    components: {
        EventActions,
        Button,
        Badge,
        Tooltip,
        Dropdown,
        DropdownItem,
        DropdownDivider,
        ParticipantsModal,
        LiquidityModal,
        BetModal,
    },
})
</script>

<template>
    <router-link :to="`/events/${event.id}`">
        <div ref="card" :class="$style.wrapper">
            <BetModal
                :show="showBetModal"
                :event="event"
                :preselectedSide="preselectedSide"
                @onBet="showBetModal = false"
                @onClose="showBetModal = false"
            />
            <LiquidityModal
                :show="showLiquidityModal"
                :event="event"
                @onClose="showLiquidityModal = false"
            />
            <ParticipantsModal
                :show="showParticipantsModal"
                @onClose="showParticipantsModal = false"
                :event="event"
            />

            <Dropdown
                :forceOpen="openContextMenu"
                @onClose="openContextMenu = false"
                :class="$style.dropdown"
                :style="{ ...contextMenuStyles }"
            >
                <template v-slot:dropdown>
                    <router-link :to="`/events/${event.id}`">
                        <DropdownItem>
                            <Icon name="open" size="16" />Open Event page
                        </DropdownItem>
                    </router-link>

                    <DropdownDivider />

                    <DropdownItem @click.prevent="handleParticipants">
                        <Icon name="users" size="16" />View participants
                    </DropdownItem>
                    <DropdownItem disabled>
                        <Icon name="notifications" size="16" />Notifiy me
                    </DropdownItem>

                    <DropdownDivider />

                    <DropdownItem @click.prevent="copy('id')">
                        <Icon name="copy" size="16" />Copy ID
                    </DropdownItem>
                    <DropdownItem @click.prevent="copy('url')">
                        <Icon name="copy" size="16" />Copy URL
                    </DropdownItem>
                </template>
            </Dropdown>

            <div :class="$style.header">
                <div :class="$style.symbol_imgs">
                    <img :src="getCurrencyIcon(symbol.split('-')[0])" />
                    <img :src="getCurrencyIcon('USD')" />
                </div>

                <div :class="$style.users">
                    <Tooltip position="bottom" side="right">
                        <div :class="$style.participants">
                            <img
                                v-for="participantAvatar in participantsAvatars.slice(
                                    0,
                                    3,
                                )"
                                :key="participantAvatar"
                                :src="`https://services.tzkt.io/v1/avatars/${participantAvatar}`"
                                :class="[
                                    $style.user_avatar,
                                    $style.participant,
                                ]"
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
                                    verifiedMakers.hangzhounet
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
                            event.creatorId == verifiedMakers.hangzhounet
                                ? "Recurring event from Juster"
                                : "Custom event from user"
                        }}</template>
                    </Tooltip>
                </div>
            </div>

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
                    supportedMarkets[symbol] &&
                    supportedMarkets[symbol].description
                }}
                <span>price event</span>
            </div>

            <div :class="$style.timing">
                <div :class="$style.days">
                    {{
                        `${timing.start.day} ${
                            timing.showDay ? `- ${timing.end.day}` : ``
                        } ${timing.start.month}`
                    }}
                </div>

                <div :class="$style.dot" />

                <div :class="$style.hrs">
                    {{ timing.start.time }}
                    ->
                    {{ timing.end.time }}
                    <span>({{ event.measurePeriod / 3600 }}h)</span>
                </div>
            </div>

            <div :class="$style.badges">
                <Tooltip
                    v-if="startStatus == 'In progress' && event.status == 'NEW'"
                    position="bottom"
                    side="left"
                >
                    <Badge color="green" :class="$style.main_badge">
                        <Icon name="event_new" size="12" />New
                    </Badge>

                    <template v-slot:content>
                        The event is available for betting and providing
                        liquidity
                    </template>
                </Tooltip>
                <Tooltip
                    v-else-if="
                        startStatus == 'Finished' && event.status == 'NEW'
                    "
                    position="bottom"
                    side="left"
                >
                    <Badge color="yellow" :class="$style.main_badge">
                        <Icon name="event_new" size="12" />Starting
                    </Badge>

                    <template v-slot:content
                        >Betting is closed. The event is starting</template
                    >
                </Tooltip>
                <Tooltip
                    v-else-if="event.status == 'STARTED'"
                    position="bottom"
                    side="left"
                >
                    <Badge color="yellow" :class="$style.main_badge">
                        <Icon name="event_active" size="12" />Active
                    </Badge>
                    <template v-slot:content
                        >Betting is closed. The end of the event is
                        pending</template
                    >
                </Tooltip>
                <Tooltip
                    v-else-if="event.status == 'FINISHED'"
                    position="bottom"
                    side="left"
                >
                    <Badge color="gray" :class="$style.main_badge">
                        <Icon name="event_finished" size="12" />Finished
                    </Badge>
                    <template v-slot:content
                        >The event is closed, winning side determined</template
                    >
                </Tooltip>
                <Tooltip
                    v-else-if="event.status == 'CANCELED'"
                    position="bottom"
                    side="left"
                >
                    <Badge color="orange" :class="$style.main_badge">
                        <Icon name="stop" size="12" />Canceled
                    </Badge>
                    <template v-slot:content
                        >This event has been canceled, funds returned</template
                    >
                </Tooltip>

                <Badge
                    v-if="participantsAvatars.length >= 3"
                    color="red"
                    :class="$style.badge"
                >
                    <Icon name="hot" size="12" />
                </Badge>

                <Tooltip
                    v-if="event.creatorId !== verifiedMakers.hangzhounet"
                    position="bottom"
                    side="left"
                >
                    <Badge color="yellow" :class="$style.badge">
                        <Icon name="bolt" size="12" /> Custom
                    </Badge>

                    <template v-slot:content>Custom event from user</template>
                </Tooltip>

                <Tooltip position="bottom" side="right">
                    <Badge v-if="userTVL" color="gray" :class="$style.badge">
                        <img
                            :src="`https://services.tzkt.io/v1/avatars/${accountStore.pkh}`"
                            :class="$style.my_avatar"
                        />
                        {{ abbreviateNumber(userTVL) }} XTZ
                    </Badge>

                    <template v-slot:content>My TVL: Bets + Liquidity</template>
                </Tooltip>
            </div>

            <div :class="$style.hints">
                <div
                    v-if="startStatus == 'In progress'"
                    :class="[$style.hint, $style.gray]"
                >
                    <Icon name="time" size="14" />
                    <div>
                        Starting in
                        <span>
                            {{ timeToStart.num == 0 ? "<1" : timeToStart.num }}
                            {{ timeToStart.suffix }}
                        </span>
                    </div>
                </div>

                <div
                    v-else-if="
                        startStatus == 'Finished' && event.status == 'NEW'
                    "
                    :class="[$style.hint, $style.gray]"
                >
                    <Icon name="time" size="14" />
                    <div>Starting</div>
                </div>

                <div
                    v-else-if="
                        startStatus == 'Finished' && event.status == 'STARTED'
                    "
                    :class="[$style.hint, $style.yellow]"
                >
                    <Icon name="time" size="14" />
                    <div>
                        Ending in
                        <span>
                            {{
                                timeToFinish.num == 0 ? "<1" : timeToFinish.num
                            }}
                            {{ timeToFinish.suffix }}
                        </span>
                    </div>
                </div>

                <div
                    v-else-if="event.status == 'FINISHED'"
                    :class="[$style.hint, $style.gray]"
                >
                    <Icon name="time" size="14" />
                    <div>
                        Ended
                        <span>
                            {{
                                DateTime.fromISO(event.betsCloseTime)
                                    .plus({ second: event.measurePeriod })
                                    .toRelative()
                            }}
                        </span>
                    </div>
                </div>

                <div
                    v-if="event.status == 'CANCELED'"
                    :class="[$style.hint, $style.red]"
                >
                    <Icon name="flag" size="14" />
                    <div><span>Start price</span> is not determined</div>
                </div>

                <Tooltip
                    v-if="event.status !== 'FINISHED'"
                    side="left"
                    textAlign="left"
                >
                    <div
                        :class="[
                            $style.hint,
                            liquidityLevel == 'Low' && $style.red,
                            liquidityLevel == 'Medium' && $style.yellow,
                            liquidityLevel == 'High' && $style.green,
                            liquidityLevel == 'Ultra' && $style.red,
                        ]"
                    >
                        <Icon
                            :name="
                                (liquidityLevel == 'Low' && 'liquidity_low') ||
                                (liquidityLevel == 'Medium' &&
                                    'liquidity_medium') ||
                                (liquidityLevel == 'High' &&
                                    'liquidity_high') ||
                                (liquidityLevel == 'Ultra' && 'liquidity_ultra')
                            "
                            size="14"
                        />

                        <div>
                            <span>{{ liquidityLevel }}</span>
                            liquidity
                        </div>
                    </div>

                    <template #content>
                        <span>Total Value Locked:</span>
                        {{ event.totalValueLocked }} <br />
                        <span>Total Liquidity Provided:</span>
                        {{ event.totalLiquidityProvided }}
                    </template>
                </Tooltip>

                <Tooltip v-if="event.winnerBets == 'BELOW'" side="left">
                    <div :class="[$style.hint, $style.red]">
                        <Icon name="lower" size="14" />
                        <div><span>Fall</span> won</div>
                    </div>

                    <template #content
                        ><span>Start rate - Closed rate =</span> <br />
                        {{
                            (
                                event.closedRate * 100 -
                                event.startRate * 100
                            ).toFixed(2)
                        }}</template
                    >
                </Tooltip>

                <Tooltip v-if="event.winnerBets == 'ABOVE_EQ'" side="left">
                    <div :class="[$style.hint, $style.green]">
                        <Icon name="higher" size="14" />
                        <div><span>Rise</span> won</div>
                    </div>

                    <template #content
                        ><span>Start rate - Closed rate =</span> <br />
                        {{
                            (
                                event.closedRate * 100 -
                                event.startRate * 100
                            ).toFixed(2)
                        }}</template
                    >
                </Tooltip>
            </div>

            <EventActions
                @onBet="handleBet"
                @onWithdraw="handleWithdraw"
                :event="event"
                :won="won"
                :wonPosition="positionForWithdraw"
                :disabled="
                    event.totalLiquidityProvided == 0 ||
                    startStatus == 'Finished'
                "
                :isWithdrawing="isWithdrawing"
            />
        </div>
    </router-link>
</template>

<style module>
.wrapper {
    background: var(--card-bg);
    border-radius: 10px;
    border: 1px solid var(--border);

    padding: 20px;
    max-width: 617px;

    transition: all 0.2s ease;
}

.wrapper:hover {
    border: 1px solid var(--border-highlight);
}

.dropdown {
    position: absolute;
}

.header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    margin-bottom: 20px;
}

.symbol_imgs {
    position: relative;

    width: 30px;
    height: 30px;
}

.symbol_imgs img {
    width: 20px;
    height: 20px;
    border-radius: 5px;
}

.symbol_imgs img:first-child {
    position: absolute;
    z-index: 1;
    outline: 3px solid var(--card-bg);
}

.symbol_imgs img:last-child {
    position: absolute;
    top: 10px;
    right: 0;
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

.title {
    display: flex;
    align-items: center;

    height: 20px;

    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);

    margin-bottom: 8px;
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

.timing {
    display: flex;
    align-items: center;
    gap: 8px;

    font-size: 12px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-secondary);

    margin-bottom: 16px;
}

.days {
    color: var(--text-tertiary);
}

.hrs span {
    color: var(--text-tertiary);
}

.dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--border);
}

.badges {
    display: flex;
    align-items: center;

    margin-bottom: 24px;
}

.main_badge {
    margin-right: 12px;
}

.badge {
    margin-right: 4px;
}

.hints {
    display: flex;
    flex-direction: column;
    gap: 12px;

    height: 40px;

    margin-bottom: 24px;
}

.hint {
    display: flex;
    align-items: center;

    font-size: 12px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-tertiary);
}

.hint.red svg {
    fill: var(--red);
}

.hint.yellow svg {
    fill: var(--yellow);
}

.hint.green svg {
    fill: var(--green);
}

.hint span {
    color: var(--text-secondary);
}

.hint svg {
    margin-right: 8px;
}

.hint.yellow {
    fill: var(--yellow);
}

.hint.green {
    fill: var(--green);
}

.hint.red {
    fill: var(--red);
}

.hint.gray {
    fill: var(--text-secondary);
}

.my_avatar {
    width: 16px;
    height: 16px;
}
</style>