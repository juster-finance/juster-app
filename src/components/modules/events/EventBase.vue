<script>
import {
    defineComponent,
    ref,
    reactive,
    watch,
    computed,
    onMounted,
    onUnmounted,
    inject,
} from "vue"
import { useMeta } from "vue-meta"
import { DateTime } from "luxon"
import { useRouter } from "vue-router"
import { cloneDeep } from "lodash"

/**
 * UI
 */
import Breadcrumbs from "@/components/ui/Breadcrumbs"
import Button from "@/components/ui/Button"
import Label from "@/components/ui/Label"
import Spin from "@/components/ui/Spin"
import Tooltip from "@/components/ui/Tooltip"
import Banner from "@/components/ui/Banner"
import {
    Dropdown,
    DropdownItem,
    DropdownDivider,
} from "@/components/ui/Dropdown"

/**
 * Local
 */
import EventChart from "./EventChart"
import EventPoolCard from "./EventPoolCard"
import EventSymbolCard from "./EventSymbolCard"
import EventDetailsCard from "./EventDetailsCard"
import EventTargetsCard from "./EventTargetsCard"

import ParticipantsModal from "@/components/local/modals/ParticipantsModal"
import LiquidityModal from "@/components/local/modals/LiquidityModal"
import BetModal from "@/components/local/modals/BetModal"
import BetCard from "./BetCard"
import DepositCard from "./DepositCard"

/**
 * Composable
 */
import { useCountdown } from "@/composable/date"

/**
 * API
 */
import { fetchEventById, fetchEventParticipants } from "@/api/events"

/**
 * Store
 */
import { useMarketStore } from "@/store/market"
import { useAccountStore } from "@/store/account"
import { useNotificationsStore } from "@/store/notifications"

/**
 * Services
 */
import { numberWithSymbol, abbreviateNumber } from "@/services/utils/amounts"
import { toClipboard, getCurrencyIcon } from "@/services/utils/global"
import { supportedSymbols } from "@/services/config"
import { juster, gql } from "@/services/tools"

export default defineComponent({
    name: "EventBase",

    setup() {
        const amplitude = inject("amplitude")

        const router = useRouter()

        const breadcrumbs = reactive([
            {
                name: "All events",
                path: "/events",
            },
        ])

        /**
         * Stores
         */
        const marketStore = useMarketStore()
        const accountStore = useAccountStore()
        const notificationsStore = useNotificationsStore()

        /**
         * Modals
         */
        const showBetModal = ref(false)
        const showLiquidityModal = ref(false)
        const showParticipantsModal = ref(false)

        /**
         * Switch between Liquidity <-> Bet
         */
        const handleSwitch = () => {
            showBetModal.value = !showBetModal.value
            showLiquidityModal.value = !showLiquidityModal.value
        }

        /**
         * Filters
         */
        const filters = reactive({
            bets: "all",
            liquidity: "all",
        })
        const handleSelectFilter = ({ target, value }) => {
            filters[target] = value
        }

        /**
         * Local Event
         */
        const event = ref(null)
        const getEvent = async () => {
            if (event.value) return

            const { id: eventId } = router.currentRoute.value.params
            event.value = await fetchEventById({ id: eventId })

            /** breadcrumbs */
            breadcrumbs.push({
                name: `Event #${event.value.id}`,
                path: `/events/${event.value.id}`,
            })
        }

        const won = computed(() => {
            if (!event.value) return

            return !!event.value.bets
                .filter((bet) => bet.userId == accountStore.pkh)
                .filter((bet) => bet.side == event.value.winnerBets).length
        })

        const canWithdraw = computed(() => {
            return accountStore.wonPositions.some(
                (position) => position.event.id == event.value.id,
            )
        })

        /** Countdown setup */
        const eventStartTime = computed(() =>
            new Date(event.value?.betsCloseTime).getTime(),
        )
        const {
            status: countdownStatus,
            time,
            stop,
        } = useCountdown(eventStartTime)

        // eslint-disable-next-line vue/return-in-computed-property
        const timeLeft = computed(() => {
            if (time.h > 0) {
                return { num: time.h, suffix: time.h > 1 ? "hrs" : "hr" }
            }
            if (time.h == 0) {
                return { num: time.m, suffix: time.m > 1 ? "mins" : "min" }
            }
        })

        const symbol = computed(() => event.value.currencyPair.symbol)

        const price = computed(() => {
            return {
                rate: marketStore.symbols[event.value?.currencyPair.symbol]
                    ?.quotes[0]?.price,
                integer: numberWithSymbol(
                    marketStore.symbols[
                        event.value?.currencyPair.symbol
                    ]?.quotes[0]?.price
                        .toString()
                        .split(".")[0],
                    ",",
                ),
                fraction: marketStore.symbols[
                    event.value?.currencyPair.symbol
                ]?.quotes[0]?.price
                    .toString()
                    .split(".")[1],
            }
        })

        const participants = ref(0)

        /**
         * Liquidity (Deposits) & Bets
         */
        const filteredDeposits = computed(() => {
            if (!event.value) return []

            if (filters.liquidity == "all") {
                return event.value.deposits
            } else {
                return event.value.deposits.filter(
                    (deposit) => deposit.userId == accountStore.pkh,
                )
            }
        })
        const filteredBets = computed(() => {
            if (!event.value) return []

            if (filters.bets == "all") {
                return event.value.bets
            } else {
                return event.value.bets.filter(
                    (bet) => bet.userId == accountStore.pkh,
                )
            }
        })
        const pendingBet = ref(null)
        const userBets = computed(() =>
            event.value
                ? event.value.bets.filter(
                      (bet) => bet.userId == accountStore.pkh,
                  )
                : [],
        )

        const highestRatio = computed(() => {
            const hRatio = event.value?.poolBelow / event.value?.poolAboveEq + 1
            const lRatio = event.value?.poolAboveEq / event.value?.poolBelow + 1

            return Math.max(hRatio, lRatio).toFixed(2)
        })

        const percentage = computed(() => {
            return event.value?.targetDynamics * 100 - 100
        })

        /** Event day */
        const todayDt = DateTime.now()
        const eventDt = computed(() =>
            DateTime.fromISO(event.value?.betsCloseTime),
        )
        const day = computed(() =>
            todayDt.hasSame(eventDt.value, "day")
                ? "Today"
                : eventDt.value.toLocaleString({
                      month: "long",
                      day: "numeric",
                  }),
        )

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

        const handleJoin = (event) => {
            event.stopPropagation()
            showBetModal.value = true

            amplitude.logEvent("showBetModal", { where: "event_base" })
        }

        const handleBet = (bet) => {
            pendingBet.value = bet
            showBetModal.value = false
        }

        const handleLiquidity = () => {
            showLiquidityModal.value = true

            amplitude.logEvent("showLiquidityModal", { where: "event_base" })
        }

        const handleWithdraw = (e) => {
            e.stopPropagation()

            amplitude.logEvent("clickWithdraw", { where: "event_base" })

            juster
                .withdraw(event.value.id, accountStore.pkh)
                .then((op) => {
                    console.log(`Hash: ${op.opHash}`)

                    /** rm won position from store */
                    accountStore.wonPositions =
                        accountStore.wonPositions.filter(
                            (position) => position.event.id != event.value.id,
                        )

                    notificationsStore.create({
                        notification: {
                            type: "success",
                            title: "Withdrawal request sent",
                            description:
                                "Processing takes about 10-30 seconds. Funds will appear in your wallet soon",
                            autoDestroy: true,
                        },
                    })
                })
                .catch((err) => console.log(err))
        }

        const handleParticipants = () => {
            showParticipantsModal.value = true

            amplitude.logEvent("showParticipantsModal", { where: "event_base" })
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

        watch(event, async () => {
            await getEvent()
        })

        /**
         * Get event -> Subscribe (refactor needed) -> Participants
         */
        onMounted(async () => {
            await getEvent()

            /** Subscribe to event, TODO: refactor */
            await gql
                .subscription({
                    event: [
                        {
                            where: { id: { _eq: event.value.id } },
                        },
                        {
                            id: true,
                            status: true,
                            betsCloseTime: true,
                            creatorId: true,
                            poolAboveEq: true,
                            poolBelow: true,
                            totalBetsAmount: true,
                            totalLiquidityProvided: true,
                            totalLiquidityShares: true,
                            totalValueLocked: true,
                            liquidityPercent: true,
                            measurePeriod: true,
                            closedOracleTime: true,
                            createdTime: true,
                            startRate: true,
                            closedRate: true,
                            winnerBets: true,
                            targetDynamics: true,
                            currencyPair: {
                                id: true,
                                symbol: true,
                            },
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

                        /** Clear pending bet on update */
                        if (
                            event.value.bets.length !== newEvent[0].bets.length
                        ) {
                            pendingBet.value = null
                        }

                        event.value = newEvent[0]
                    },
                    error: console.error,
                })

            /** Participants */
            const eventParticipants = await fetchEventParticipants({
                id: event.value.id,
            })
            participants.value = eventParticipants.length
        })

        onUnmounted(() => {
            stop()
        })

        /** Meta */
        const { meta } = useMeta({
            title: `Event`,
            description:
                "Available symbols for events, for providing liquidity and accepting bets from users",
        })

        return {
            breadcrumbs,
            marketStore,
            accountStore,
            event,
            won,
            canWithdraw,
            handleSelectFilter,
            filters,
            filteredDeposits,
            filteredBets,
            pendingBet,
            userBets,
            timeLeft,
            price,
            symbol,
            participants,
            highestRatio,
            percentage,
            countdownStatus,
            day,
            timing,
            showBetModal,
            showLiquidityModal,
            showParticipantsModal,
            handleSwitch,
            handleJoin,
            handleLiquidity,
            handleParticipants,
            handleBet,
            handleWithdraw,
            copy,
            getCurrencyIcon,
            abbreviateNumber,
            cloneDeep,
            supportedSymbols,
        }
    },

    components: {
        Breadcrumbs,
        Button,
        Label,
        Banner,
        Spin,
        Tooltip,
        Dropdown,
        DropdownItem,
        DropdownDivider,
        ParticipantsModal,
        LiquidityModal,
        BetModal,
        BetCard,
        DepositCard,
        EventChart,
        EventPoolCard,
        EventSymbolCard,
        EventDetailsCard,
        EventTargetsCard,
    },
})
</script>

<template>
    <div :class="$style.wrapper">
        <metainfo>
            <template v-slot:title="{ content }"
                >{{ content }} • Juster</template
            >
        </metainfo>

        <BetModal
            v-if="event"
            :show="showBetModal"
            :event="event"
            @switch="handleSwitch"
            @onBet="handleBet"
            @onClose="showBetModal = false"
        />
        <LiquidityModal
            v-if="event"
            :show="showLiquidityModal"
            :event="event"
            @switch="handleSwitch"
            @onClose="showLiquidityModal = false"
        />
        <ParticipantsModal
            v-if="event"
            :show="showParticipantsModal"
            :event="event"
            @onClose="showParticipantsModal = false"
        />

        <Breadcrumbs :crumbs="breadcrumbs" :class="$style.breadcrumbs" />

        <div v-if="event" :class="$style.container">
            <div :class="$style.base">
                <Banner v-if="won" type="success" :class="$style.banner"
                    >You have chosen the correct outcome of the event. You can
                    withdraw your reward ✨</Banner
                >
                <Banner
                    v-if="event.status == 'CANCELED'"
                    type="error"
                    :class="$style.banner"
                    >The event was canceled due to problems with the start of
                    price measurement. All bets and liquidity are
                    refunded</Banner
                >

                <div v-if="event" :class="$style.event">
                    <div :class="$style.header">
                        <div :class="$style.info">
                            <!-- Name -->
                            <h3 :class="$style.name">
                                <div :class="$style.symbol_image">
                                    <img
                                        :src="
                                            getCurrencyIcon(
                                                symbol.split('-')[0],
                                            )
                                        "
                                    />

                                    <Icon
                                        v-if="event.winnerBets"
                                        name="higher"
                                        size="16"
                                        :class="
                                            event.winnerBets == 'ABOVE_EQ'
                                                ? $style.higher
                                                : $style.lower
                                        "
                                    />
                                </div>

                                {{ supportedSymbols[symbol].description }}
                            </h3>

                            <!-- Timing -->
                            <div v-if="timing.showDay" :class="$style.timing">
                                {{ timing.start.day }}
                                <span>{{ timing.start.time }}</span>
                                ->
                                {{ timing.end.day }}
                                <span>{{ timing.end.time }}</span>
                            </div>
                            <div v-else :class="$style.timing">
                                {{ timing.start.day }}
                                <span>{{ timing.start.time }}</span> ->
                                <span>{{ timing.end.time }}</span>
                            </div>

                            <!-- Labels -->
                            <div :class="$style.labels">
                                <Tooltip
                                    v-if="event.status == 'CANCELED'"
                                    position="bottom"
                                    side="left"
                                >
                                    <Label icon="stop" color="red"
                                        >Canceled</Label
                                    >

                                    <template v-slot:content>
                                        Event canceled due to problems with
                                        starting or finishing price
                                    </template>
                                </Tooltip>

                                <Tooltip
                                    v-else-if="countdownStatus == 'In progress'"
                                    position="bottom"
                                    side="left"
                                >
                                    <Label icon="flag" color="orange"
                                        >Start in&nbsp;
                                        <span>{{
                                            timeLeft.num == 0
                                                ? "<1"
                                                : timeLeft.num
                                        }}</span>
                                        {{ timeLeft.suffix }}</Label
                                    >

                                    <template v-slot:content>
                                        Time left to make a bet or provide
                                        liquidity
                                    </template>
                                </Tooltip>

                                <Tooltip
                                    v-else-if="
                                        countdownStatus == 'Finished' &&
                                        event.status == 'NEW'
                                    "
                                    position="bottom"
                                    side="left"
                                >
                                    <Label icon="flag" color="orange"
                                        >Soon</Label
                                    >

                                    <template v-slot:content>
                                        Bets are no longer accepted, the event
                                        will start soon
                                    </template>
                                </Tooltip>

                                <Tooltip
                                    v-else-if="
                                        countdownStatus == 'Finished' &&
                                        event.status == 'STARTED'
                                    "
                                    position="bottom"
                                    side="left"
                                >
                                    <Label icon="time" color="orange" loading
                                        >In progress</Label
                                    >

                                    <template v-slot:content>
                                        Start price is fixed, waiting for event
                                        completion
                                    </template>
                                </Tooltip>

                                <Tooltip
                                    v-else-if="
                                        countdownStatus == 'Finished' &&
                                        event.status == 'FINISHED'
                                    "
                                    position="bottom"
                                    side="left"
                                >
                                    <Label icon="check">Finished</Label>

                                    <template v-slot:content>
                                        Event is over, winners are determined
                                    </template>
                                </Tooltip>

                                <Tooltip position="bottom" side="left">
                                    <Label icon="money" color="green"
                                        ><span>{{
                                            abbreviateNumber(
                                                event.totalValueLocked,
                                            )
                                        }}</span
                                        >XTZ</Label
                                    >

                                    <template v-slot:content>
                                        Total value locked: Liquidity + Bets
                                    </template>
                                </Tooltip>
                                <Tooltip position="bottom" side="left">
                                    <Label icon="time" color="yellow"
                                        >Duration&nbsp;
                                        <span>{{
                                            event.measurePeriod / 3600
                                        }}</span
                                        >{{
                                            event.measurePeriod / 3600 == 1
                                                ? "hour"
                                                : "hours"
                                        }}
                                    </Label>

                                    <template v-slot:content>
                                        Price measurement period
                                    </template>
                                </Tooltip>
                            </div>
                        </div>

                        <div :class="$style.actions">
                            <Dropdown>
                                <template v-slot:trigger>
                                    <Button
                                        type="tertiary"
                                        size="small"
                                        icon="dots"
                                    />
                                </template>

                                <template v-slot:dropdown>
                                    <DropdownItem @click="handleParticipants"
                                        ><Icon name="users" size="16" />View
                                        participants
                                    </DropdownItem>
                                    <DropdownItem disabled
                                        ><Icon
                                            name="notifications"
                                            size="16"
                                        />Notifiy me
                                    </DropdownItem>

                                    <DropdownDivider />

                                    <DropdownItem @click="copy('id')"
                                        ><Icon name="copy" size="16" />Copy ID
                                    </DropdownItem>
                                    <DropdownItem @click="copy('url')"
                                        ><Icon name="copy" size="16" />Copy URL
                                    </DropdownItem>
                                </template>
                            </Dropdown>

                            <Button
                                v-if="
                                    event.status == 'FINISHED' &&
                                    won &&
                                    canWithdraw
                                "
                                @click="handleWithdraw"
                                type="success"
                                size="small"
                                :disabled="event.totalLiquidityProvided == 0"
                                :class="$style.action"
                                >Withdraw</Button
                            >

                            <Button
                                v-if="won && !canWithdraw"
                                type="success"
                                size="small"
                                disabled
                                >Withdrawn</Button
                            >

                            <template
                                v-else-if="
                                    event.status == 'NEW' &&
                                    countdownStatus == 'In progress'
                                "
                            >
                                <Button
                                    @click="handleLiquidity"
                                    type="secondary"
                                    size="small"
                                    :disabled="
                                        event.totalLiquidityProvided == 0
                                    "
                                    :class="$style.action"
                                    ><Icon name="liquidity" size="16" />Add
                                    liquidity</Button
                                >
                                <Button
                                    @click="handleJoin"
                                    type="primary"
                                    size="small"
                                    :disabled="
                                        event.totalLiquidityProvided == 0
                                    "
                                    :class="$style.action"
                                    >Make a bet</Button
                                >
                            </template>
                        </div>
                    </div>
                </div>

                <EventChart
                    v-if="event && event.status !== 'CANCELED'"
                    :event="event"
                />

                <div :class="$style.block">
                    <div :class="$style.title">Bets</div>
                    <div :class="$style.description">
                        All the bets placed for this event
                    </div>

                    <div :class="$style.filters">
                        <div
                            @click="
                                handleSelectFilter({
                                    target: 'bets',
                                    value: 'my',
                                })
                            "
                            :class="[
                                $style.filter,
                                filters.bets == 'my' && $style.active,
                            ]"
                        >
                            My bets
                        </div>
                        <div :class="$style.dot" />
                        <div
                            @click="
                                handleSelectFilter({
                                    target: 'bets',
                                    value: 'all',
                                })
                            "
                            :class="[
                                $style.filter,
                                filters.bets == 'all' && $style.active,
                            ]"
                        >
                            All bets
                        </div>
                    </div>

                    <!-- todo: new component BetsTable -->
                    <div v-if="filteredBets.length" :class="$style.bets_head">
                        <span>TYPE</span>
                        <span>SIDE</span>
                        <span>AMOUNT</span>
                        <span>{{
                            event.status !== "CANCELED" ? "REWARD" : "REFUND"
                        }}</span>
                    </div>

                    <div
                        v-if="pendingBet || filteredBets.length"
                        :class="$style.bets"
                    >
                        <BetCard v-if="pendingBet" :bet="pendingBet" pending />
                        <BetCard
                            v-for="bet in cloneDeep(filteredBets).sort(
                                (a, b) =>
                                    new Date(b.createdTime) -
                                    new Date(a.createdTime),
                            )"
                            :event="event"
                            :key="bet.id"
                            :bet="bet"
                        />
                    </div>

                    <Banner v-else type="info">{{
                        filters.bets == "all"
                            ? `Still no bets for this event, maybe yours will be the first?`
                            : `If you have placed a bet, but it is not in this list yet — please wait for the transaction confirmation`
                    }}</Banner>

                    <div v-if="userBets.length" :class="$style.params">
                        <div :class="$style.param">
                            My bets:
                            <span>{{ userBets.length }}</span>
                        </div>

                        <div :class="$style.dot" />

                        <div :class="$style.param">
                            Summary:
                            <span>{{
                                userBets
                                    .reduce(
                                        (acc, { amount }) => acc + amount,
                                        0,
                                    )
                                    .toFixed(2)
                            }}</span>
                            XTZ
                        </div>

                        <div :class="$style.dot" />

                        <div :class="[$style.param, $style.green]">
                            Potential reward:
                            <span>{{
                                userBets
                                    .reduce(
                                        (acc, { reward }) => acc + reward,
                                        0,
                                    )
                                    .toFixed(2)
                            }}</span>
                            XTZ
                        </div>
                    </div>
                </div>

                <div :class="$style.block">
                    <div :class="$style.title">Liquidity</div>
                    <div :class="$style.description">
                        All the liquidity provided for this event
                    </div>

                    <div :class="$style.filters">
                        <div
                            @click="
                                handleSelectFilter({
                                    target: 'liquidity',
                                    value: 'my',
                                })
                            "
                            :class="[
                                $style.filter,
                                filters.liquidity == 'my' && $style.active,
                            ]"
                        >
                            My liquidity
                        </div>
                        <div :class="$style.dot" />
                        <div
                            @click="
                                handleSelectFilter({
                                    target: 'liquidity',
                                    value: 'all',
                                })
                            "
                            :class="[
                                $style.filter,
                                filters.liquidity == 'all' && $style.active,
                            ]"
                        >
                            All liquidity
                        </div>
                    </div>

                    <div
                        v-if="filteredDeposits.length"
                        :class="$style.bets_head"
                    >
                        <span>TYPE</span>
                        <span>RISE</span>
                        <span>FALL</span>
                    </div>
                    <div v-if="filteredDeposits.length" :class="$style.bets">
                        <DepositCard
                            v-for="deposit in cloneDeep(filteredDeposits).sort(
                                (a, b) =>
                                    new Date(b.createdTime) -
                                    new Date(a.createdTime),
                            )"
                            :key="deposit.id"
                            :deposit="deposit"
                        />
                    </div>
                    <Banner v-else type="info">{{
                        filters.liquidity == "all"
                            ? `This event has not yet received initial liquidity, please wait for a few minutes`
                            : `If you have provided liquidity, but it is not reflected in this list yet — please wait for the transaction confirmation`
                    }}</Banner>

                    <div v-if="userBets.length" :class="$style.params">
                        <div :class="$style.param">
                            Liquidity deposits:
                            <span>{{ filteredDeposits.length }}</span>
                        </div>

                        <div :class="$style.dot" />

                        <div :class="$style.param">
                            Summary:
                            <span>{{
                                filteredDeposits
                                    .reduce(
                                        (acc, { amountBelow }) =>
                                            acc + amountBelow,
                                        0,
                                    )
                                    .toFixed(2)
                            }}</span>
                            XTZ
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="event" :class="$style.side">
                <EventTargetsCard :event="event" :price="price" />

                <!-- <EventSymbolCard
                    v-if="event && price.integer"
                    :event="event"
                    :price="price"
                /> -->

                <EventPoolCard :event="event" />

                <EventDetailsCard
                    :event="event"
                    :participants="participants"
                    :highestRatio="highestRatio"
                />

                <div :class="$style.additional_buttons">
                    <Button type="tertiary" size="small" disabled
                        ><Icon name="flag" size="16" />Report this event</Button
                    >
                    <router-link to="/docs/how-to-bet">
                        <Button type="tertiary" size="small"
                            ><Icon name="book" size="16" /><span
                                >Read how to</span
                            >Make a bet</Button
                        >
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<style module>
.wrapper {
}

.breadcrumbs {
    margin-bottom: 24px;
}

.container {
    display: flex;
    gap: 32px;
}

.base {
    flex: 1;
}

.side {
    display: flex;
    flex-direction: column;
    gap: 8px;

    min-width: 384px;
    max-width: 384px;
}

.banner {
    margin-bottom: 16px;
}

.event {
    background: var(--card-bg);
    border-radius: 8px;
    border: 1px solid var(--border);
    padding: 20px 0 20px 0;
    flex: 1;

    margin-bottom: 8px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    padding: 0 20px;
}

.info {
    display: flex;
    flex-direction: column;
}

.name {
    display: flex;
    align-items: center;

    margin-bottom: 12px;
}

.symbol_image {
    position: relative;

    margin-right: 10px;
}

.symbol_image svg {
    position: absolute;
    top: -4px;
    right: -4px;

    background: var(--card-bg);
    border-radius: 50%;
}

.symbol_image svg.higher {
    fill: var(--green);
}

.symbol_image svg.lower {
    fill: var(--red);
    transform: rotate(180deg);
}

.symbol_image img {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    opacity: 0.7;
}

.name span {
    color: var(--text-tertiary);

    margin-left: 6px;
}

.timing {
    font-size: 12px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-tertiary);

    margin-bottom: 16px;
}

.timing span {
    color: var(--text-secondary);
}

.labels {
    display: flex;
    gap: 6px;
}

.divider {
    width: 100%;
    border: 1px solid var(--border);

    margin: 20px 0;
}

.actions {
    display: flex;
    align-items: center;
    gap: 6px;
}

.block {
    position: relative;

    margin-top: 40px;
}

.block .title {
    font-size: 17px;
    line-height: 1.2;
    font-weight: 500;
    color: var(--text-primary);

    margin-bottom: 8px;
}

.block .description {
    font-size: 12px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-tertiary);

    margin-bottom: 24px;
}

.empty {
    display: flex;
    align-items: center;
    gap: 8px;

    font-size: 14px;
    line-height: 1.6;
    color: var(--text-tertiary);
    fill: var(--text-tertiary);
}

.bets_head {
    display: flex;
    align-items: center;

    padding: 0 16px;
    margin-bottom: 8px;
}

.bets_head span {
    font-size: 12px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-tertiary);
}

.bets_head span:nth-child(1) {
    flex: 2;
}

.bets_head span:nth-child(2) {
    flex: 1;
}

.bets_head span:nth-child(3) {
    flex: 1;
}

.bets_head span:nth-child(4) {
    flex: 1;
}

.bets {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.params {
    display: flex;
    align-items: center;
    gap: 20px;

    margin-top: 20px;
}

.param {
    font-size: 13px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-tertiary);
}

.param span {
    color: var(--text-primary);
}

.param.green span {
    color: var(--green);
}

.additional_buttons {
    display: flex;
    justify-content: space-between;
}

.filters {
    position: absolute;
    top: 0;
    right: 0;

    width: max-content;
    display: flex;
    align-items: center;
    gap: 14px;

    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--btn-secondary-bg);
    box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.2);
    height: 32px;
    padding: 0 12px;
}

.filters .dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--opacity-10);
}

.filter {
    display: flex;
    align-items: center;
    gap: 6px;

    cursor: pointer;

    font-size: 13px;
    font-weight: 600;
    color: var(--text-tertiary);
    fill: var(--text-tertiary);

    transition: all 0.2s ease;
}

.filter:hover {
    fill: var(--text-primary);
    color: var(--text-primary);
}

.filter.active {
    fill: var(--blue);
    color: var(--text-primary);
}
</style>
