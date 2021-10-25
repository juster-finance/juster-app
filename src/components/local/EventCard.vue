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
} from "vue"
import { DateTime } from "luxon"
import { useRouter } from "vue-router"
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
import Label from "@/components/ui/Label"
import Tooltip from "@/components/ui/Tooltip"

/**
 * Local
 */
import ParticipantsModal from "@/components/local/modals/ParticipantsModal"
import LiquidityModal from "@/components/local/modals/LiquidityModal"
import BetModal from "@/components/local/modals/BetModal"
import Pool from "@/components/local/Pool"

/**
 * Services
 */
import { toClipboard, getCurrencyIcon } from "@/services/utils/global"
import { juster } from "@/services/tools"
import { abbreviateNumber } from "@/services/utils/amounts"

/**
 * Composable
 */
import { useCountdown } from "@/composable/date"

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
        won: Boolean,
    },

    setup(props) {
        const { event } = toRefs(props)
        const notificationsStore = useNotificationsStore()
        const accountStore = useAccountStore()
        const marketStore = useMarketStore()

        const card = ref(null)
        const openContextMenu = ref(false)

        const router = useRouter()
        const handleOpenEvent = () => {
            router.push(`/events/${event.value.id}`)
        }

        const showBetModal = ref(false)
        const showLiquidityModal = ref(false)
        const showParticipantsModal = ref(false)

        const subscription = ref({})

        const symbol = computed(() => event.value.currencyPair.symbol)

        /** Countdown setup */
        const { status, time, stop } = useCountdown(event)

        // eslint-disable-next-line vue/return-in-computed-property
        const timeLeft = computed(() => {
            if (time.h > 0) {
                return { num: time.h, suffix: time.h > 1 ? "hrs" : "hr" }
            }
            if (time.h == 0) {
                return { num: time.m, suffix: time.m > 1 ? "mins" : "min" }
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

        /** Join to the event & Liquidity */
        const handleJoin = event => {
            event.stopPropagation()
            showBetModal.value = true
        }
        const handleLiquidity = event => {
            event.stopPropagation()
            showLiquidityModal.value = true
        }

        /** Withdraw */
        const handleWithdraw = e => {
            e.stopPropagation()

            juster
                .withdraw(event.value.id, accountStore.pkh)
                .then(op => {
                    console.log(`Hash: ${op.opHash}`)

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
                .catch(err => console.log(err))
        }

        const copy = target => {
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
        const contextMenuHandler = e => {
            e.preventDefault()

            contextMenuStyles.top = `${e.clientY}px`
            contextMenuStyles.left = `${e.clientX}px`

            openContextMenu.value = !openContextMenu.value
        }

        const handleSwitch = () => {
            showBetModal.value = !showBetModal.value
            showLiquidityModal.value = !showLiquidityModal.value
        }

        onMounted(async () => {
            card.value.addEventListener("contextmenu", contextMenuHandler)

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
                            betsCloseTime: true,
                            liquidityPercent: true,
                            status: true,
                            startRate: true,
                            closedRate: true,
                            winnerBets: true,
                            bets: {
                                amount: true,
                                userId: true,
                            },
                        },
                    ],
                })
                .subscribe({
                    next: data => {
                        const { event: newEvent } = data

                        marketStore.updateEvent({
                            target: symbol.value,
                            newEvent: newEvent[0],
                        })
                    },
                    error: console.error,
                })
        })

        onBeforeUnmount(() => {
            card.value.removeEventListener("contextmenu", contextMenuHandler)
        })

        onUnmounted(() => {
            if (!subscription.value?.closed) subscription.value.unsubscribe()

            stop()
        })

        return {
            card,
            openContextMenu,
            contextMenuStyles,
            showBetModal,
            showLiquidityModal,
            showParticipantsModal,
            handleOpenEvent,
            event,
            timing,
            timeLeft,
            status,
            symbol,
            percentage,
            handleJoin,
            handleLiquidity,
            handleWithdraw,
            copy,
            handleSwitch,
            getCurrencyIcon,
            abbreviateNumber,
        }
    },

    components: {
        Button,
        Label,
        Pool,
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
    <div @click="handleOpenEvent" ref="card" :class="$style.wrapper">
        <BetModal
            :show="showBetModal"
            :event="event"
            @switch="handleSwitch"
            @onClose="showBetModal = false"
        />
        <LiquidityModal
            :show="showLiquidityModal"
            :event="event"
            @switch="handleSwitch"
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
                    <DropdownItem
                        ><Icon name="open" size="16" />Open Event
                        page</DropdownItem
                    >
                </router-link>

                <DropdownDivider />

                <DropdownItem @click="showParticipantsModal = true"
                    ><Icon name="users" size="16" />View participants
                </DropdownItem>
                <DropdownItem disabled
                    ><Icon name="notifications" size="16" />Notifiy me
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

        <div :class="[$style.header, !chart && $style.mg]">
            <div :class="$style.info">
                <div :class="$style.top">
                    <div :class="$style.top_left">
                        <!-- Name -->
                        <h3 :class="$style.name">
                            <div :class="$style.symbol_image">
                                <img
                                    :src="getCurrencyIcon(symbol.split('-')[0])"
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

                            {{ symbol.split("-")[0] }}

                            <span v-if="!event.winnerBets">will rise</span>
                            <span v-else-if="event.winnerBets == 'ABOVE_EQ'"
                                >went up
                            </span>
                            <span v-else-if="event.winnerBets == 'BELOW'"
                                >went down
                            </span>
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
                    </div>

                    <div :class="$style.actions">
                        <Button
                            v-if="event.status == 'FINISHED' && won"
                            @click="handleWithdraw"
                            type="success"
                            size="small"
                            :disabled="event.totalLiquidityProvided == 0"
                            :class="$style.action"
                            >Withdraw</Button
                        >

                        <!-- todo: new component ButtonGroup -->
                        <div
                            v-else-if="
                                event.status == 'NEW' && status == 'In progress'
                            "
                            :class="$style.button_group"
                        >
                            <div @click="handleJoin" :class="$style.button">
                                Join
                            </div>
                            <div :class="$style.group_divider" />
                            <div
                                @click="handleLiquidity"
                                :class="$style.button"
                            >
                                <Icon name="liquidity" size="16" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- labels -->
                <div :class="$style.labels">
                    <Tooltip
                        v-if="status == 'In progress'"
                        position="bottom"
                        side="left"
                    >
                        <Label icon="flag" color="orange"
                            ><span>{{
                                timeLeft.num == 0 ? "<1" : timeLeft.num
                            }}</span>
                            {{ timeLeft.suffix }}</Label
                        >

                        <template v-slot:content>
                            Time until the end of accepting bets
                        </template>
                    </Tooltip>

                    <Tooltip
                        v-else-if="
                            status == 'Finished' && event.status == 'NEW'
                        "
                        position="bottom"
                        side="left"
                    >
                        <Label icon="flag" color="orange">Soon</Label>

                        <template v-slot:content>
                            Acceptance of bets is over, the event will start
                            soon
                        </template>
                    </Tooltip>

                    <Tooltip
                        v-else-if="
                            status == 'Finished' && event.status == 'STARTED'
                        "
                        position="bottom"
                        side="left"
                    >
                        <Label icon="time" color="orange" loading
                            >In process</Label
                        >

                        <template v-slot:content>
                            Measuring period in progress
                        </template>
                    </Tooltip>

                    <Tooltip
                        v-else-if="
                            status == 'Finished' && event.status == 'FINISHED'
                        "
                        position="bottom"
                        side="left"
                    >
                        <Label icon="check">Finished</Label>

                        <template v-slot:content>
                            The event is over, the winners are determined
                        </template>
                    </Tooltip>

                    <Tooltip position="bottom" side="left">
                        <Label icon="money" color="green"
                            ><span>{{
                                abbreviateNumber(event.totalValueLocked)
                            }}</span
                            >XTZ</Label
                        >

                        <template v-slot:content>
                            Total value locked: Liquidity + Bets
                        </template>
                    </Tooltip>
                    <Tooltip position="bottom" side="left">
                        <Label icon="money" color="yellow"
                            ><span>{{ event.measurePeriod / 3600 }}</span
                            >h</Label
                        >

                        <template v-slot:content>
                            Measure period (h - Hour, m - Minute)
                        </template>
                    </Tooltip>
                </div>
            </div>
        </div>

        <Pool :event="event" :class="$style.pool" />
    </div>
</template>

<style module>
.wrapper {
    background: var(--card-bg);
    border-radius: 10px;
    border: 1px solid var(--border);
    box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.5);

    padding: 20px;

    transition: all 0.2s ease;
}

.wrapper:hover {
    border: 1px solid var(--border-highlight);
}

.wrapper:active {
    transform: translateY(1px);
}

.dropdown {
    position: absolute;
}

.header {
    width: 100%;
    display: flex;
    align-items: flex-start;
}

.info {
    width: 100%;
}

.top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.top_left {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.name {
    display: flex;
    align-items: center;
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
    fill: var(--text-tertiary);

    margin-bottom: 16px;
}

.timing span {
    color: var(--text-secondary);
}

.labels {
    display: flex;
    gap: 6px;
}

.pool {
    margin-top: 24px;
}

.actions {
    display: flex;
    align-items: center;
    gap: 6px;
}

.button_group {
    display: flex;
    align-items: center;

    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--btn-secondary-bg);
    padding: 0 2px;

    font-size: 13px;
    line-height: 1.1;
    font-weight: 600;
    color: var(--text-primary);

    transition: all 0.2s ease;
}

.button_group:hover {
    background: var(--btn-secondary-bg-hover);
}

.button_group:active {
    transform: translateY(1px);
}

.button {
    display: flex;
    align-items: center;

    padding: 0 10px;
    height: 28px;
}

.button svg {
    fill: var(--text-primary);
}

.group_divider {
    width: 1px;
    height: 20px;
    background: var(--border);
}
</style>
