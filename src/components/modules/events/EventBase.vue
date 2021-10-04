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
import ParticipantsModal from "@/components/local/modals/ParticipantsModal"
import LiquidityModal from "@/components/local/modals/LiquidityModal"
import BetModal from "@/components/local/modals/BetModal"
import EventSymbolCard from "./EventSymbolCard"
import EventDetailsCard from "./EventDetailsCard"
import EventPoolCard from "./EventPoolCard"
import EventTargetsCard from "./EventTargetsCard"
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
import { fetchDepositsByEvent } from "@/api/deposits"
import { fetchBetsByEvent } from "@/api/bets"

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

        const handleSwitch = () => {
            showBetModal.value = !showBetModal.value
            showLiquidityModal.value = !showLiquidityModal.value
        }

        const filters = reactive({
            bets: "my",
            liquidity: "all",
        })
        const handleSelectFilter = ({ target, value }) => {
            filters[target] = value
        }

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

        const symbol = computed(() => event.value.currency_pair.symbol)

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

        const deposits = ref([])
        const bets = ref([])

        const filteredDeposits = computed(() => {
            if (filters.liquidity == "all") {
                return deposits.value
            } else {
                return deposits.value.filter(
                    deposit => deposit.user_id == accountStore.pkh,
                )
            }
        })
        const filteredBets = computed(() => {
            if (filters.bets == "all") {
                return bets.value
            } else {
                return bets.value.filter(bet => bet.user_id == accountStore.pkh)
            }
        })

        const userBets = computed(() =>
            bets.value.filter(bet => bet.user_id == accountStore.pkh),
        )

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
        })

        onMounted(async () => {
            await getEvent()

            /** Participants */
            const eventParticipants = await fetchEventParticipants({
                id: event.value.id,
            })
            participants.value = eventParticipants.length

            /** All submissions */
            const allDeposits = await fetchDepositsByEvent({
                event_id: event.value.id,
            })
            deposits.value = cloneDeep(allDeposits).sort(
                (a, b) => new Date(b.created_time) - new Date(a.created_time),
            )

            const allBets = await fetchBetsByEvent({ event_id: event.value.id })
            bets.value = cloneDeep(allBets).sort(
                (a, b) => new Date(b.created_time) - new Date(a.created_time),
            )
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
            handleSelectFilter,
            filters,
            deposits,
            bets,
            filteredDeposits,
            filteredBets,
            userBets,
            timeLeft,
            price,
            symbol,
            participants,
            deposits,
            bets,
            highestRatio,
            percentage,
            countdownStatus,
            day,
            period,
            showBetModal,
            showLiquidityModal,
            showParticipantsModal,
            handleSwitch,
            handleJoin,
            copy,
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
        EventSymbolCard,
        BetCard,
        DepositCard,
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
            @switch="handleSwitch"
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

        <div :class="$style.container">
            <div :class="$style.base">
                <div v-if="event" :class="$style.event">
                    <div :class="$style.header">
                        <div :class="$style.info">
                            <!-- Name -->
                            <h3 :class="$style.name">
                                <img
                                    v-if="symbol.split('-')[0] == 'XTZ'"
                                    src="@/assets/symbols/tz.png"
                                />
                                <img
                                    v-if="symbol.split('-')[0] == 'ETH'"
                                    src="@/assets/symbols/eth.png"
                                />
                                <img
                                    v-if="symbol.split('-')[0] == 'BTC'"
                                    src="@/assets/symbols/btc.png"
                                />

                                {{ symbol.split("-")[0] }}
                                <span>will rise</span>
                            </h3>

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
                                    <Label icon="time" color="yellow"
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

                            <template
                                v-else-if="
                                    event.status == 'NEW' &&
                                        countdownStatus == 'In progress'
                                "
                            >
                                <Button
                                    @click="showLiquidityModal = true"
                                    type="secondary"
                                    size="small"
                                    :disabled="
                                        event.total_liquidity_provided == 0
                                    "
                                    :class="$style.action"
                                    ><Icon name="liquidity" size="16" />Provide
                                    liquidity</Button
                                >
                                <Button
                                    @click="handleJoin"
                                    type="primary"
                                    size="small"
                                    :disabled="
                                        event.total_liquidity_provided == 0
                                    "
                                    :class="$style.action"
                                    >Make a bet</Button
                                >
                            </template>
                        </div>
                    </div>
                </div>

                <div :class="$style.block">
                    <div :class="$style.title">Bets</div>
                    <div :class="$style.description">
                        All bets for all users and with filtering only your
                        claims
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
                        <span>REWARD</span>
                    </div>
                    <div v-if="filteredBets.length" :class="$style.bets">
                        <BetCard
                            v-for="bet in filteredBets"
                            :key="bet.id"
                            :bet="bet"
                        />
                    </div>
                    <Banner v-else type="info">{{
                        filters.bets == "all"
                            ? `There are no bets for this event yet. Make your first
                        bet and get a profitable ratio`
                            : `You have not placed any bets for this event. If you have done, but do not see it - wait for the transaction confirmation`
                    }}</Banner>

                    <div v-if="userBets.length" :class="$style.params">
                        <div :class="$style.param">
                            Total bets:
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
                                bets
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
                        All liquidity for all users and with filtering only your
                        claims
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
                        <span>ABOVE</span>
                        <span>BELOW</span>
                        <span>SHARES</span>
                    </div>
                    <div v-if="filteredDeposits.length" :class="$style.bets">
                        <DepositCard
                            v-for="deposit in filteredDeposits"
                            :key="deposit.id"
                            :deposit="deposit"
                        />
                    </div>
                    <Banner v-else type="info">{{
                        filters.liquidity == "all"
                            ? `This event has not yet received initial liquidity. You
                        need to wait a couple of minutes`
                            : `You did not provide liquidity for this event. Provide and earn as a provider`
                    }}</Banner>
                </div>
            </div>

            <div v-if="event" :class="$style.side">
                <EventTargetsCard :event="event" :price="price" />

                <EventSymbolCard
                    v-if="event && price.integer"
                    :event="event"
                    :price="price"
                />

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

    width: 384px;
}

.event {
    background: var(--card-bg);
    border-radius: 8px;
    border: 1px solid var(--border);
    padding: 20px 0 20px 0;
    flex: 1;
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

.name img {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    opacity: 0.7;

    margin-right: 10px;
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
    box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.5);
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
