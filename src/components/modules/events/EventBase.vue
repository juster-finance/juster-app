<script>
import {
    defineComponent,
    ref,
    reactive,
    watch,
    computed,
    onMounted,
    onUnmounted,
} from "vue"
import { useMeta } from "vue-meta"
import { DateTime } from "luxon"
import { useRouter } from "vue-router"

/**
 * UI
 */
import Breadcrumbs from "@/components/ui/Breadcrumbs"
import Button from "@/components/ui/Button"
import Label from "@/components/ui/Label"
import Spin from "@/components/ui/Spin"
import Tooltip from "@/components/ui/Tooltip"
import {
    Dropdown,
    DropdownItem,
    DropdownDivider,
} from "@/components/ui/Dropdown"

/**
 * Local
 */
import ParticipantsModal from "@/components/local/modals/ParticipantsModal"
import LiquidityModal from "@/components/local/modals/LiquidityModal"
import BetModal from "@/components/local/modals/BetModal"
import EventChartCard from "./EventChartCard"
import EventDetailsCard from "./EventDetailsCard"
import EventPoolCard from "./EventPoolCard"
import EventTargetsCard from "./EventTargetsCard"
import SubmissionCard from "./SubmissionCard"

/**
 * Composable
 */
import { useCountdown } from "@/composable/date"

/**
 * API
 */
import { fetchEventById, fetchEventParticipants } from "@/api/events"
import { fetchBetsByUser } from "@/api/bets"

/**
 * Store
 */
import { useMarketStore } from "@/store/market"
import { useAccountStore } from "@/store/account"
import { useNotificationsStore } from "@/store/notifications"

/**
 * Services
 */
import { numberWithSymbol } from "@/services/utils/amounts"
import { toClipboard } from "@/services/utils/global"

const StatusState = {
    NOT_STARTED: "not_started",
    IN_PROGRESS: "in_progress",
    COMPLETED: "completed",
}

export default defineComponent({
    name: "EventBase",

    setup() {
        const breadcrumbs = reactive([
            {
                name: "All events",
                path: "/events",
            },
        ])

        const marketStore = useMarketStore()
        const accountStore = useAccountStore()
        const notificationsStore = useNotificationsStore()

        const router = useRouter()

        const showBetModal = ref(false)
        const showLiquidityModal = ref(false)
        const showParticipantsModal = ref(false)

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

        const submissions = ref([])

        /** Countdown setup */
        const { status: countdownStatus, time, stop } = useCountdown(event)

        // eslint-disable-next-line vue/return-in-computed-property
        const timeLeft = computed(() => {
            if (time.h > 0) {
                return { num: time.h, suffix: time.h > 1 ? "hrs" : "hr" }
            }
            if (time.h == 0) {
                return { num: time.m, suffix: time.m > 1 ? "mins" : "min" }
            }
        })

        const price = computed(() => {
            return {
                rate:
                    marketStore.symbols[event.value?.currency_pair.symbol]
                        ?.quotes[0]?.price,
                integer: numberWithSymbol(
                    marketStore.symbols[
                        event.value?.currency_pair.symbol
                    ]?.quotes[0]?.price
                        .toString()
                        .split(".")[0],
                    ",",
                ),
                fraction: marketStore.symbols[
                    event.value?.currency_pair.symbol
                ]?.quotes[0]?.price
                    .toString()
                    .split(".")[1],
            }
        })

        const participants = ref(0)

        const highestRatio = computed(() => {
            const hRatio =
                event.value?.pool_below / event.value?.pool_above_eq + 1
            const lRatio =
                event.value?.pool_above_eq / event.value?.pool_below + 1

            return Math.max(hRatio, lRatio).toFixed(2)
        })

        const percentage = computed(() => {
            return event.value?.target_dynamics * 100 - 100
        })

        /** Event day */
        const todayDt = DateTime.now()
        const eventDt = computed(() =>
            DateTime.fromISO(event.value?.bets_close_time),
        )
        const day = computed(() =>
            todayDt.hasSame(eventDt.value, "day")
                ? "Today"
                : eventDt.value.toLocaleString({
                      month: "long",
                      day: "numeric",
                  }),
        )

        const period = computed(() => {
            return {
                start: eventDt.value
                    .setLocale("ru")
                    .toLocaleString(DateTime.TIME_SIMPLE),
                end: eventDt.value
                    .plus(event.value?.measure_period * 1000)
                    .setLocale("ru")
                    .toLocaleString(DateTime.TIME_SIMPLE),
            }
        })

        const statuses = reactive([
            {
                name: "Created",
                icon: "flag",
                time: null,
                state: StatusState.COMPLETED,
            },
            {
                name: "Bets time",
                icon: "bolt",
                time: null,
                state: StatusState.NOT_STARTED,
            },
            {
                name: "Started",
                icon: "time",
                time: null,
                state: StatusState.NOT_STARTED,
            },
            {
                name: "Finished",
                icon: "flag",
                time: null,
                state: StatusState.NOT_STARTED,
            },
        ])
        const updateStatuses = () => {
            for (let i = 0; i < statuses.length; i++) {
                const status = statuses[i]

                if (status.name == "Created") {
                    status.time = DateTime.fromISO(
                        event.value?.created_time,
                    ).toLocaleString({
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hourCycle: "h23",
                    })
                }
                if (status.name == "Bets time") {
                    if (
                        countdownStatus.value == "In progress" &&
                        event.value?.status == "NEW"
                    ) {
                        status.state = StatusState.IN_PROGRESS
                    } else if (countdownStatus.value == "Finished") {
                        status.state = StatusState.COMPLETED
                        status.time = DateTime.fromISO(
                            event.value?.bets_close_time,
                        ).toLocaleString({
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hourCycle: "h23",
                        })
                    }
                }
                if (status.name == "Started") {
                    if (event.value?.status == "STARTED") {
                        status.state = StatusState.IN_PROGRESS
                    } else if (event.value?.status == "FINISHED") {
                        status.state = StatusState.COMPLETED
                        status.time = DateTime.fromISO(
                            event.value?.closed_oracle_time,
                        ).toLocaleString({
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hourCycle: "h23",
                        })
                    }
                }
                if (status.name == "Finished") {
                    if (event.value?.status == "FINISHED") {
                        status.state = StatusState.COMPLETED
                        status.time = DateTime.fromISO(
                            event.value?.closed_oracle_time,
                        ).toLocaleString({
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hourCycle: "h23",
                        })
                    }
                }
            }
        }

        const handleJoin = event => {
            event.stopPropagation()
            showBetModal.value = true
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

        watch(event, async () => {
            await getEvent()
            updateStatuses()
        })

        watch(countdownStatus, () => {
            updateStatuses()
        })

        onMounted(async () => {
            await getEvent()
            updateStatuses()

            const eventParticipants = await fetchEventParticipants({
                id: event.value.id,
            })
            participants.value = eventParticipants.length

            submissions.value = await fetchBetsByUser({
                event_id: event.value.id,
                address: accountStore.pkh,
            })
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
            submissions,
            timeLeft,
            price,
            participants,
            highestRatio,
            percentage,
            countdownStatus,
            day,
            period,
            statuses,
            StatusState,
            showBetModal,
            showLiquidityModal,
            showParticipantsModal,
            handleJoin,
            copy,
        }
    },

    components: {
        Breadcrumbs,
        Button,
        Label,
        Spin,
        Tooltip,
        Dropdown,
        DropdownItem,
        DropdownDivider,
        ParticipantsModal,
        LiquidityModal,
        BetModal,
        EventChartCard,
        SubmissionCard,
        EventDetailsCard,
        EventPoolCard,
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
            @onClose="showBetModal = false"
        />
        <LiquidityModal
            v-if="event"
            :show="showLiquidityModal"
            :event="event"
            @onClose="showLiquidityModal = false"
        />
        <ParticipantsModal
            v-if="event"
            :show="showParticipantsModal"
            :event="event"
            @onClose="showParticipantsModal = false"
        />

        <Breadcrumbs :crumbs="breadcrumbs" :class="$style.breadcrumbs" />

        <div :class="$style.container">
            <div :class="$style.base">
                <div v-if="event" :class="$style.event">
                    <div :class="$style.header">
                        <div :class="$style.info">
                            <!-- Name -->
                            <template
                                v-if="
                                    event.target_dynamics == 1 ||
                                        event.target_dynamics == 0
                                "
                            >
                                <h3
                                    v-if="event.target_dynamics == 1"
                                    :class="$style.name"
                                >
                                    The price will rise
                                </h3>
                                <h3
                                    v-if="event.target_dynamics == 0"
                                    :class="$style.name"
                                >
                                    The price will fall
                                </h3>
                            </template>
                            <template v-else>
                                <h3 v-if="percentage > 0" :class="$style.name">
                                    The price will rise by
                                    <span :class="$style.rise"
                                        >{{ Math.abs(percentage) }}%</span
                                    >
                                </h3>
                                <h3 v-if="percentage < 0" :class="$style.name">
                                    The price will fall by
                                    <span :class="$style.fall"
                                        >{{ Math.abs(percentage) }}%</span
                                    >
                                </h3>
                            </template>

                            <!-- Timing -->
                            <div :class="$style.timing">
                                {{ day }}, <span>{{ period.start }}</span> ->
                                <span>{{ period.end }}</span>
                            </div>

                            <!-- Labels -->
                            <div :class="$style.labels">
                                <Tooltip
                                    v-if="countdownStatus == 'In progress'"
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
                                        Time until the end of accepting bets
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
                                        Acceptance of bets is over, the event
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
                                        >In process</Label
                                    >

                                    <template v-slot:content>
                                        Measuring period in progress
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
                                    <Label icon="check">Done</Label>

                                    <template v-slot:content>
                                        The event is over, the winners are
                                        determined
                                    </template>
                                </Tooltip>

                                <Tooltip position="bottom" side="left">
                                    <Label icon="money" color="yellow">{{
                                        event.currency_pair.symbol
                                    }}</Label>

                                    <template v-slot:content>
                                        Currency pair for which the event took
                                        place
                                    </template>
                                </Tooltip>
                                <Tooltip position="bottom" side="left">
                                    <Label icon="money" color="green"
                                        ><span>{{
                                            event.total_value_locked
                                        }}</span
                                        >XTZ</Label
                                    >

                                    <template v-slot:content>
                                        Total value locked: Liquidity + Bets
                                    </template>
                                </Tooltip>
                                <Tooltip position="bottom" side="left">
                                    <Label icon="money" color="yellow"
                                        >Duration&nbsp;
                                        <span>{{
                                            event.measure_period / 3600
                                        }}</span
                                        >{{
                                            event.measure_period / 3600 == 1
                                                ? "hour"
                                                : "hours"
                                        }}
                                    </Label>

                                    <template v-slot:content>
                                        Measure period
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
                                    <router-link :to="`/events/${event.id}`">
                                        <DropdownItem
                                            ><Icon name="open" size="16" />Open
                                            Event page</DropdownItem
                                        >
                                    </router-link>

                                    <DropdownDivider />

                                    <DropdownItem
                                        @click="showLiquidityModal = true"
                                        :disabled="
                                            event.status !== 'NEW' &&
                                                countdownStatus !==
                                                    'In progress'
                                        "
                                        ><Icon name="liquidity" size="16" />Add
                                        liquidity
                                    </DropdownItem>
                                    <DropdownItem
                                        @click="showParticipantsModal = true"
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
                                v-if="event.status == 'FINISHED' && won"
                                @click="handleWithdraw"
                                type="success"
                                size="small"
                                :disabled="event.total_liquidity_provided == 0"
                                :class="$style.action"
                                >Withdraw</Button
                            >

                            <Button
                                v-else-if="
                                    event.status == 'NEW' &&
                                        countdownStatus == 'In progress'
                                "
                                @click="handleJoin"
                                type="secondary"
                                size="small"
                                :disabled="event.total_liquidity_provided == 0"
                                :class="$style.action"
                                >Join</Button
                            >
                        </div>
                    </div>
                </div>

                <div :class="$style.statuses">
                    <div
                        v-for="(status, index) in statuses"
                        :key="index"
                        :class="[
                            $style.status,
                            status.state == StatusState.NOT_STARTED &&
                                $style.opacity,
                        ]"
                    >
                        <div :class="$style.status_icon">
                            <Icon
                                v-if="status.state !== StatusState.IN_PROGRESS"
                                :name="status.icon"
                                size="14"
                            />
                            <Spin v-else size="16" />
                        </div>

                        <div :class="$style.status_base">
                            <div :class="$style.status_name">
                                {{ status.name }}
                            </div>

                            <div
                                v-if="status.state == StatusState.COMPLETED"
                                :class="$style.status_time"
                            >
                                {{ status.time }}
                            </div>
                            <div
                                v-else-if="
                                    status.state == StatusState.IN_PROGRESS
                                "
                                :class="$style.status_time"
                            >
                                In progress
                            </div>
                            <div
                                v-else-if="
                                    status.state == StatusState.NOT_STARTED
                                "
                                :class="$style.status_time"
                            >
                                Not started
                            </div>
                        </div>

                        <div
                            v-if="index !== statuses.length - 1"
                            :class="$style.dots"
                        >
                            <div :class="$style.dot" />
                            <div :class="$style.dot" />
                            <div :class="$style.dot" />
                        </div>
                    </div>
                </div>

                <div :class="$style.block">
                    <div :class="$style.title">My submissions</div>
                    <div :class="$style.description">
                        List of your bets & liquidity for the event
                    </div>

                    <div v-if="submissions.length" :class="$style.submissions">
                        <SubmissionCard
                            v-for="submission in submissions"
                            :key="submission.id"
                            :submission="submission"
                        />
                    </div>
                    <div v-else-if="accountStore.pkh" :class="$style.empty">
                        <Icon name="help" size="16" /> You do not have any
                        submissions for this event
                    </div>
                    <div v-else :class="$style.empty">
                        <Icon name="help" size="16" /> Login to see your
                        submissions for this event
                    </div>

                    <div v-if="submissions.length" :class="$style.params">
                        <div :class="$style.param">
                            Total submissions:
                            <span>{{ submissions.length }}</span>
                        </div>

                        <div :class="$style.dot" />

                        <div :class="$style.param">
                            Summary:
                            <span>{{
                                submissions
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
                                submissions
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
                    <div :class="$style.title">Discussions</div>
                    <div :class="$style.description">
                        Discuss this event with other users
                    </div>

                    <div :class="$style.empty">
                        <Icon name="help" size="16" /> Currently unavailable
                    </div>
                </div>
            </div>

            <div v-if="event" :class="$style.side">
                <EventTargetsCard :event="event" :price="price" />

                <!-- <EventChartCard
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
                    <router-link to="/docs">
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

    width: 384px;
}

.event {
    background: var(--card-bg);
    border-radius: 8px;
    border: 1px solid var(--border);
    padding: 24px 0 24px 0;
    flex: 1;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    padding: 0 24px;
}

.info {
    display: flex;
    flex-direction: column;
}

.name {
    margin-bottom: 8px;
}

.name span.rise {
    color: var(--green);
}

.name span.fall {
    color: var(--red);
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

.statuses {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24px;

    border-radius: 8px;
    height: 60px;
    background: var(--card-bg);
    border: 1px solid var(--border);

    margin-top: 8px;
    margin-bottom: 40px;
}

.dots {
    display: flex;
    gap: 8px;

    margin-left: 24px;
}

.dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--opacity-20);
}

.status {
    display: flex;
    align-items: center;

    transition: opacity 0.2s ease;
}

.status.opacity {
    opacity: 0.5;
}

.status_icon {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 24px;
    height: 24px;
    box-sizing: content-box;
    border-radius: 50%;
    background: var(--opacity-10);
    fill: var(--icon);
    margin-right: 12px;
}

.status_base {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.status_name {
    font-size: 13px;
    line-height: 1.1;
    font-weight: 600;
    color: var(--text-primary);
}

.status_time {
    font-size: 12px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-tertiary);
}

.block {
    margin-bottom: 40px;
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

.submissions {
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
    font-size: 14px;
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
</style>
