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
    watch,
} from "vue"
import * as d3 from "d3"
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
import { prepareQuotesForD3 } from "@/services/utils/quotes"
import { toClipboard } from "@/services/utils/global"
import { juster } from "@/services/tools"

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
        showSymbol: Boolean,
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

        const symbol = computed(() => event.value.currency_pair.symbol)
        const quotes = computed(() => {
            return marketStore.symbols[symbol.value].quotes.slice(0, 30)
        })

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
            return event.value?.target_dynamics * 100 - 100
        })

        const timing = computed(() => {
            const eventDt = DateTime.fromISO(
                event.value.bets_close_time,
            ).setLocale("ru")

            const endDt = eventDt.plus(event.value.measure_period * 1000)

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

        /** Chart */
        const draw = () => {
            const margin = { top: 20, right: 20, bottom: 20, left: 0 },
                width = 500 - margin.left - margin.right,
                height = 140 - margin.top - margin.bottom

            d3.select(`#chart_${event.value.id} > *`).remove()

            const svg = d3
                .select(`#chart_${event.value.id}`)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`)

            const data = prepareQuotesForD3({ quotes: quotes.value })

            const x = d3
                .scaleTime()
                .domain(d3.extent(data, d => d.date))
                .range([0, width])

            const y = d3
                .scaleLinear()
                .domain([
                    d3.min(data, d => +d.value),
                    d3.max(data, d => +d.value),
                ])
                .range([height, 0])

            svg.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "#1aa168")
                .attr("stroke-width", 1.5)
                .attr(
                    "d",
                    d3
                        .line()
                        .x(d => x(d.date))
                        .y(d => y(d.value)),
                )

            svg.append("circle")
                .attr("cx", x(data[data.length - 1].date))
                .attr("cy", y(data[data.length - 1].value))
                .attr("r", 2)
                .attr("fill", "#fff")

            /** animated circle */
            svg.append("circle")
                .attr("id", "animated_circle")
                .attr("cx", x(data[data.length - 1].date))
                .attr("cy", y(data[data.length - 1].value))
                .attr("fill", "rgba(255,255,255,0.07)")
                .attr("stroke", "rgba(255,255,255, 0.5)")
                .attr("stroke-width", "2px")

            svg.select("#animated_circle")
                .html(`<animate id="ac1" attributeType="SVG" attributeName="r" begin="1s;ac1.end+2s" dur="1.5s" from="1%" to="10%" />
              <animate id="ac2" attributeType="CSS" attributeName="stroke-width" begin="1s;ac2.end+2s"  dur="1.5s" from="2px" to="0px" />
              <animate id="ac3" attributeType="CSS" attributeName="opacity" begin="1s;ac3.end+2s"  dur="1.5s" from="1" to="0" />`)
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

        onMounted(async () => {
            card.value.addEventListener("contextmenu", contextMenuHandler)

            if (quotes.value.length) draw()

            /** Subscription, TODO: refactor */

            subscription.value = await gql
                .subscription({
                    juster_event: [
                        {
                            where: { id: { _eq: event.value.id } },
                        },
                        {
                            id: true,
                            pool_above_eq: true,
                            pool_below: true,
                            total_liquidity_shares: true,
                            total_value_locked: true,
                            total_liquidity_provided: true,
                            created_time: true,
                            bets_close_time: true,
                            liquidity_percent: true,
                            status: true,
                            start_rate: true,
                            closed_rate: true,
                            winner_bets: true,
                            bets: {
                                amount: true,
                                user_id: true,
                            },
                        },
                    ],
                })
                .subscribe({
                    next: data => {
                        const { juster_event: newEvent } = data

                        marketStore.updateEvent({
                            target: symbol.value,
                            newEvent: newEvent[0],
                        })
                    },
                    error: console.error,
                })
        })

        watch(quotes, () => {
            if (quotes.value.length) draw()
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
                <div v-if="timing.showDay" :class="$style.timing">
                    <span>{{ timing.start.time }}</span> ({{
                        timing.start.day
                    }}) -> <span>{{ timing.end.time }}</span> ({{
                        timing.end.day
                    }})
                </div>
                <div v-else :class="$style.timing">
                    {{ timing.start.day }}
                    <span>{{ timing.start.time }}</span> ->
                    <span>{{ timing.end.time }}</span>
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
                        <Label icon="check">Done</Label>

                        <template v-slot:content>
                            The event is over, the winners are determined
                        </template>
                    </Tooltip>

                    <Tooltip v-if="showSymbol" position="bottom" side="left">
                        <Label icon="money" color="yellow">{{
                            event.currency_pair.symbol
                        }}</Label>

                        <template v-slot:content>
                            Currency pair for which the event took place
                        </template>
                    </Tooltip>
                    <Tooltip position="bottom" side="left">
                        <Label icon="money" color="green"
                            ><span>{{ event.total_value_locked }}</span
                            >XTZ</Label
                        >

                        <template v-slot:content>
                            Total value locked: Liquidity + Bets
                        </template>
                    </Tooltip>
                    <Tooltip position="bottom" side="left">
                        <Label icon="money" color="yellow"
                            ><span>{{ event.measure_period / 3600 }}</span
                            >h</Label
                        >

                        <template v-slot:content>
                            Measure period (h - Hour, m - Minute)
                        </template>
                    </Tooltip>
                </div>
            </div>

            <div :class="$style.actions">
                <Button
                    v-if="event.status == 'FINISHED' && won"
                    @click="handleWithdraw"
                    type="success"
                    size="small"
                    :disabled="event.total_liquidity_provided == 0"
                    :class="$style.action"
                    >Withdraw</Button
                >

                <!-- todo: new component ButtonGroup -->
                <div
                    v-else-if="event.status == 'NEW' && status == 'In progress'"
                    :class="$style.button_group"
                >
                    <div @click="handleJoin" :class="$style.button">Join</div>
                    <div :class="$style.group_divider" />
                    <div @click="handleLiquidity" :class="$style.button">
                        <Icon name="liquidity" size="16" />
                    </div>
                </div>

                <router-link
                    v-else-if="event.status == 'NEW' && status == 'Finished'"
                    :to="`/events/${event.id}`"
                >
                    <Button type="tertiary" size="small" :class="$style.action"
                        >View</Button
                    ></router-link
                >
                <router-link
                    v-else-if="
                        event.status == 'STARTED' && status == 'Finished'
                    "
                    :to="`/events/${event.id}`"
                >
                    <Button type="tertiary" size="small" :class="$style.action"
                        >View</Button
                    ></router-link
                >
                <router-link
                    v-else-if="event.status == 'FINISHED'"
                    :to="`/events/${event.id}`"
                >
                    <Button type="tertiary" size="small" :class="$style.action"
                        >View</Button
                    ></router-link
                >
            </div>
        </div>

        <div v-if="chart" :class="$style.chart">
            <div
                :id="`chart_${event.id}`"
                @mousemove="onMouseMove"
                @mouseleave="onMouseLeave"
            />
        </div>

        <div v-if="chart" :class="$style.divider" />

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

    transition: border 0.2s ease;
}

.wrapper:hover {
    border: 1px solid var(--border-highlight);
}

.dropdown {
    position: absolute;
}

.header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
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

.chart {
    display: flex;
    align-items: center;
    justify-content: flex-end;

    overflow: hidden;

    position: relative;

    height: 140px;
    margin: 20px 24px 16px 24px;

    background-image: radial-gradient(var(--dot) 1.5px, transparent 0px);
    background-size: 10px 10px;
}

.divider {
    width: 100%;
    height: 1px;
    background: var(--border);
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
