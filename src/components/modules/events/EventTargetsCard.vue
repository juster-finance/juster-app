<script>
import { computed, defineComponent, toRefs } from "vue"

/**
 * UI
 */
import Spin from "@/components/ui/Spin"
import Tooltip from "@/components/ui/Tooltip"

export default defineComponent({
    name: "EventTargetsCard",
    props: { event: Object, price: Object },

    setup(props) {
        const { event, price } = toRefs(props)

        const wonSide = computed(() => {
            if (event.value.status == "NEW") {
                return "TBD"
            }
            if (["FINISHED", "STARTED"].includes(event.value.status)) {
                return event.value.winnerBets == "ABOVE_EQ" ? "Up" : "Down"
            }
        })

        const change = computed(() => {
            const startRate = event.value.startRate * 100
            const closedRate = event.value.closedRate * 100

            const percent =
                event.value.status == "FINISHED"
                    ? (100 * Math.abs(closedRate - startRate)) /
                      ((closedRate + startRate) / 2)
                    : (100 * Math.abs(price.value.rate - startRate)) /
                      ((price.value.rate + startRate) / 2)

            const diff =
                event.value.status == "FINISHED"
                    ? closedRate - startRate
                    : price.value.rate - startRate

            return { diff, percent }
        })

        const status = computed(() => {
            if (event.value.status == "NEW") {
                return {
                    title: "New",
                    description: "Accepting submissions",
                }
            }
            if (event.value.status == "STARTED") {
                return {
                    title: "Active",
                    description: "Bets closed, price calculation",
                }
            }
            if (event.value.status == "FINISHED") {
                return {
                    title: "Finished",
                    description: "The winning side is chosen",
                }
            }
        })

        return { wonSide, change, status }
    },

    components: { Spin, Tooltip },
})
</script>

<template>
    <div :class="$style.wrapper">
        <div :class="$style.title">
            Targets
        </div>

        <div :class="$style.targets">
            <div :class="$style.names">
                <div :class="$style.name">
                    Start price
                </div>

                <div :class="$style.name">
                    Close price
                </div>
            </div>

            <div :class="$style.items">
                <div :class="$style.item">
                    <div
                        :class="[
                            $style.target,
                            event.status == 'NEW' && $style.tbd,
                        ]"
                    >
                        <Icon name="go" size="14" />
                        {{
                            event.status == "NEW"
                                ? "TBD"
                                : `$ ${(event.startRate * 100).toFixed(2)}`
                        }}
                    </div>
                </div>

                <div :class="$style.line">
                    <div :class="$style.line_dot" />
                </div>

                <Tooltip position="bottom" side="right">
                    <div :class="$style.item">
                        <div
                            :class="[
                                $style.target,
                                event.status !== 'FINISHED' && $style.tbd,
                            ]"
                        >
                            <Spin v-if="event.status == 'STARTED'" size="14" />
                            <Icon
                                v-else-if="event.status !== 'CANCELED'"
                                name="flag"
                                size="14"
                            />
                            {{
                                (event.status == "CANCELED" && "Not Defined") ||
                                    (event.status == "FINISHED" &&
                                        `$ ${(event.closedRate * 100).toFixed(
                                            2,
                                        )}`) ||
                                    (["NEW", "STARTED"].includes(
                                        event.status,
                                    ) &&
                                        "TBD")
                            }}
                        </div>
                    </div>
                    <template v-slot:content>
                        <template v-if="event.status !== 'FINISHED'"
                            >Waiting for event completion</template
                        >
                        <template v-else>Close price is settled</template>
                    </template>
                </Tooltip>
            </div>
        </div>

        <div :class="$style.params">
            <div v-if="event.status == 'FINISHED'" :class="$style.param">
                <span>Close price</span>
                <span v-if="price.rate"
                    >$ {{ (event.closedRate * 100).toFixed(2) }}</span
                >
                <Spin size="16" v-else />
            </div>
            <div v-else :class="$style.param">
                <span>Current price</span>
                <span v-if="price.rate"
                    ><div :class="$style.price_dot" />
                    $ {{ price.rate.toFixed(2) }}</span
                >
                <Spin size="16" v-else />
            </div>

            <div :class="$style.param">
                <span>Price dynamics</span>
                <span v-if="event.status == 'CANCELED'">$ 0.00</span>
                <Spin size="16" v-else-if="!price.rate" />
                <span v-else-if="event.status == 'NEW'">TBD</span>
                <span
                    v-else
                    :class="change.diff > 0 ? $style.green : $style.red"
                    ><Icon name="carret" size="12" />{{
                        Math.abs(change.diff).toFixed(2)
                    }}
                    ({{ change.percent.toFixed(2) }}%)</span
                >
            </div>

            <div v-if="event.status == 'CANCELED'" :class="$style.param">
                <span>Winning Side</span>
                <span>Draw</span>
            </div>
            <div v-else :class="$style.param">
                <span>Winning Side</span>
                <span v-if="price.rate">
                    <Icon
                        v-if="event.status == 'FINISHED'"
                        name="higher"
                        size="16"
                        :class="wonSide == 'Up' ? $style.up : $style.down"
                    />
                    {{ wonSide }}</span
                ><Spin size="16" v-else />
            </div>
        </div>

        <!-- <div :class="$style.status">
            <div :class="$style.status_base">
                <Icon
                    :name="
                        (status.title == 'New' && 'bolt') ||
                            (status.title == 'Active' && 'time') ||
                            (status.title == 'Finished' && 'flag')
                    "
                    size="16"
                />

                <span>{{ status.title }}</span>
                <div :class="$style.dot" />
                <span>{{ status.description }}</span>
            </div>

            <Icon name="help" size="14" :class="$style.help_icon" />
        </div> -->
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

    margin-bottom: 20px;
}

.targets {
    display: flex;
    flex-direction: column;
    gap: 8px;

    margin-bottom: 32px;
}

.names {
    display: flex;
    justify-content: space-between;
}

.items {
    display: flex;
    align-items: center;
}

.item {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.name {
    font-size: 12px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-tertiary);
    white-space: nowrap;
}

.target {
    display: flex;
    align-items: center;
    gap: 10px;

    border-radius: 8px;
    height: 32px;
    padding: 0 12px;
    border: 1px solid var(--border);

    font-size: 14px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-primary);
    fill: var(--green);
    white-space: nowrap;
}

.target.tbd {
    color: var(--text-tertiary);
}

.line {
    position: relative;
    width: 100%;
    border-bottom: 1px dashed var(--border);
}

.line_dot {
    width: 5px;
    height: 5px;
    background: #fff;
    border-radius: 50%;

    position: absolute;
    left: 50%;
    top: -2px;
}

.params {
    display: flex;
    justify-content: space-between;
}

.param {
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 10px;
}

.param span:nth-child(1) {
    font-size: 12px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-tertiary);
}

.param span:nth-child(2) {
    display: flex;
    align-items: center;
    gap: 8px;

    font-size: 16px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-primary);
}

.param span:nth-child(2).green {
    color: var(--green);
    fill: var(--green);
}

.param span:nth-child(2).red {
    color: var(--red);
    fill: var(--red);
}

.param span:nth-child(2).red svg {
    transform: rotate(180deg);
}

.up {
    fill: var(--green);
}

.down {
    transform: rotate(180deg);
    fill: var(--red);
}

.status {
    display: flex;
    align-items: center;
    justify-content: space-between;

    background: var(--opacity-05);
    height: 40px;
    border-radius: 8px;
    margin-top: 28px;
    padding: 0 14px;
    border: 1px solid var(--border);
}

.status_base {
    display: flex;
    align-items: center;
    gap: 8px;
}

.status_base svg:nth-child(1) {
    fill: var(--opacity-40);
}

.help_icon {
    fill: var(--opacity-10);
}

.status_base span {
    font-size: 13px;
    line-height: 1.1;
}

.status_base span:nth-child(2) {
    color: var(--text-primary);
    font-weight: 600;
}

.status_base span:last-child {
    color: var(--text-tertiary);
    font-weight: 500;
}

.dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--border);
}

.price_dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--blue);
}
</style>
