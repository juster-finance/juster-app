<script setup>
import { reactive, ref, toRefs, watch, computed } from "vue"

/**
 * Modals
 */
import FindParticipantModal from "@/components/local/modals/FindParticipantModal"

/**
 * UI
 */
import Button from "@/components/ui/Button"
import Checkbox from "@/components/ui/Checkbox"
import Toggle from "@/components/ui/Toggle"
import Tooltip from "@/components/ui/Tooltip"

/**
 * Store
 */
import { useAccountStore } from "@/store/account"

/**
 * Services
 */
import { analytics } from "@/services/sdk"

const props = defineProps({
    filters: { type: Object },
    liquidityFilters: { type: Object },
    events: { type: Array },
})
const emit = defineEmits([
    "onReset",
    "onNewMin",
    "onManageParticipant",
    "onNewMax",
    "onSelect",
])

const selectedTab = ref("Basic")

const accountStore = useAccountStore()

/** modals */
const showFindParticipantModal = ref(false)

const position = reactive({
    left: 0,
    right: 0,
})

const inputs = reactive({
    min: 0,
    max: 50000,
})

const minInputEl = ref(null)
const maxInputEl = ref(null)

const handleReset = () => {
    analytics.log("onResetFilters")

    inputs.min = 0
    inputs.max = 50000

    emit("onReset")
}

const advancedFiltersCount = computed(() => {
    let count = 0

    Object.keys(props.filters.misc).forEach((filterKey) => {
        if (props.filters.misc[filterKey].active) count += 1
    })

    if (props.filters.advanced.period) {
        count += 1
    }

    if (props.filters.advanced.participants.length) {
        count += 1
    }

    return count
})

/** advanced filters (participants) */
const manageParticipant = (address, action) => {
    emit("onManageParticipant", { address, action })
}

const handleFindParticipant = (address) => {
    manageParticipant(address, "add")

    showFindParticipantModal.value = false
}

watch(
    () => inputs.min,
    () => {
        emit("onNewMin", inputs.min)

        if (inputs.min === 0) {
            position.left = 0
            return
        }

        const left = (inputs.min * 100) / 50000

        position.left = left > 0 ? left : 0
    },
)

watch(
    () => inputs.max,
    () => {
        emit("onNewMax", inputs.max)

        if (inputs.max === 50000) {
            position.right = 0
            return
        }

        const right = ((50000 - inputs.max) * 100) / 50000

        position.right = right > 0 ? right : 0
    },
)

const handleBlur = (target) => {
    if (target == "min") {
        if (inputs.min < 0) {
            inputs.min = 0
        }
    }

    if (target == "max") {
        if (inputs.max > 50000) {
            inputs.max = 50000
        }
    }

    if (inputs.min > 50000) {
        inputs.min = 0
    }

    if (inputs.max < 0) {
        inputs.max = 50000
    }
}

const handleKeydown = (e) => {
    if (e.key === "-" || e.key === "e") e.preventDefault()
}
</script>

<template>
    <div :class="$style.wrapper">
        <FindParticipantModal
            :show="showFindParticipantModal"
            @onAdd="handleFindParticipant"
            @onClose="showFindParticipantModal = false"
        />

        <div :class="$style.title">Filters</div>

        <div :class="$style.switcher">
            <div
                @click="selectedTab = 'Basic'"
                :class="[$style.tab, selectedTab == 'Basic' && $style.active]"
            >
                Basic
            </div>
            <div
                @click="selectedTab = 'Advanced'"
                :class="[
                    $style.tab,
                    selectedTab == 'Advanced' && $style.active,
                ]"
            >
                Advanced
                <div v-if="advancedFiltersCount" />
            </div>
        </div>

        <template v-if="selectedTab == 'Basic'">
            <div :class="$style.block">
                <div :class="$style.subtitle">Symbol</div>

                <div :class="$style.badges">
                    <div
                        v-for="(symbol, index) in filters.symbols"
                        :key="index"
                        @click="$emit('onSelect', 'symbols', symbol)"
                        :class="[
                            $style.badge,
                            $style.symbol,
                            symbol.active && $style.active,
                        ]"
                    >
                        <img
                            :src="
                                require(`@/assets/symbols/${
                                    (symbol.name == 'XTZ-USD' && 'tz') ||
                                    (symbol.name == 'ETH-USD' && 'eth') ||
                                    (symbol.name == 'BTC-USD' && 'btc')
                                }.png`)
                            "
                        />
                        {{ symbol.name.replace("-USD", "") }}
                    </div>
                </div>
            </div>

            <div :class="$style.block">
                <div :class="$style.subtitle">
                    <Tooltip side="left">
                        Liquidity <Icon name="help" size="12" />

                        <template #content>
                            Max value of liquidity depend on all events
                        </template>
                    </Tooltip>
                </div>

                <div :class="$style.range_picker">
                    <div :class="$style.range">
                        <div
                            :class="$style.filled_range"
                            :style="{
                                left: `${position.left}%`,
                                right: `${position.right}%`,
                            }"
                        />
                    </div>

                    <div :class="$style.range_inputs">
                        <div
                            @click="minInputEl.focus()"
                            :class="$style.range_input"
                        >
                            <Icon name="download" size="12" />
                            <input
                                ref="minInputEl"
                                v-model="inputs.min"
                                type="number"
                                step="200"
                                @keydown="handleKeydown"
                                @blur="handleBlur('min')"
                                placeholder="0"
                            />
                            <span>XTZ</span>
                        </div>

                        <div
                            @click="maxInputEl.focus()"
                            :class="$style.range_input"
                        >
                            <span>XTZ</span>
                            <input
                                ref="maxInputEl"
                                v-model="inputs.max"
                                type="number"
                                step="200"
                                @keydown="handleKeydown"
                                @blur="handleBlur('max')"
                                placeholder="0"
                                :class="$style.right"
                            />
                            <Icon
                                name="download"
                                size="12"
                                :class="$style.reverse"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div :class="$style.block">
                <div :class="$style.subtitle">Status</div>

                <div :class="$style.badges">
                    <div
                        v-for="(status, index) in filters.statuses"
                        :key="index"
                        @click="$emit('onSelect', 'statuses', status)"
                        :class="[
                            $style.badge,
                            $style[status.color],
                            status.active && $style.active,
                        ]"
                    >
                        <Icon :name="status.icon" size="14" />
                        {{ status.name }}
                    </div>
                </div>
            </div>

            <div :class="$style.block">
                <div :class="$style.subtitle">Period</div>

                <div :class="$style.badges">
                    <div
                        v-for="(period, index) in filters.periods"
                        :key="index"
                        @click="$emit('onSelect', 'periods', period)"
                        :class="[$style.badge, period.active && $style.active]"
                    >
                        <Icon name="time" size="14" />
                        {{ period.name }}
                    </div>
                </div>
            </div>
        </template>
        <template v-else>
            <div :class="$style.block">
                <div :class="$style.subtitle">Participants</div>

                <div :class="$style.badges">
                    <div
                        @click="showFindParticipantModal = true"
                        :class="[$style.badge, $style.active]"
                    >
                        <Icon name="plus" size="14" /> Add user
                    </div>
                    <div
                        @click="manageParticipant(accountStore.pkh, 'add')"
                        :class="[$style.badge, $style.active]"
                    >
                        <img
                            :src="`https://services.tzkt.io/v1/avatars/${accountStore.pkh}`"
                            :class="$style.avatar"
                        />
                        Find Me
                    </div>
                </div>

                <div :class="$style.badges">
                    <div
                        v-for="participant in filters.advanced.participants"
                        :key="participant"
                        @click="manageParticipant(participant, 'remove')"
                        :class="[$style.badge, $style.active]"
                    >
                        <img
                            :src="`https://services.tzkt.io/v1/avatars/${participant}`"
                            :class="$style.avatar"
                        />
                        {{ participant.slice(0, 5) }}..{{
                            participant.slice(
                                participant.length - 4,
                                participant.length,
                            )
                        }}
                    </div>
                </div>
            </div>

            <div :class="$style.block">
                <div :class="$style.subtitle">Period</div>

                <div :class="$style.period">
                    <input
                        v-model="filters.advanced.period"
                        type="date"
                        id="filter_day"
                        name="filter_day"
                    />
                </div>
            </div>

            <div :class="$style.block">
                <div :class="$style.subtitle">Misc</div>

                <div :class="$style.misc">
                    <div :class="$style.toggle_filter">
                        <div :class="$style.left">Starting Today</div>
                        <Toggle
                            v-model="filters.misc.startingToday.active"
                            :disabled="filters.misc.startingToday.disabled"
                        />
                    </div>
                    <div :class="$style.toggle_filter">
                        <div :class="$style.left">More than 2 Participant</div>
                        <Toggle
                            v-model="filters.misc.moreThan.active"
                            :disabled="filters.misc.moreThan.disabled"
                        />
                    </div>
                    <div :class="$style.toggle_filter">
                        <div :class="$style.left">With Target Dynamics</div>
                        <Toggle
                            v-model="filters.misc.targetDynamics.active"
                            :disabled="filters.misc.targetDynamics.disabled"
                        />
                    </div>
                    <div :class="$style.toggle_filter">
                        <div :class="$style.left">Custom events</div>
                        <Toggle
                            v-model="filters.misc.customEvents.active"
                            :disabled="filters.misc.customEvents.disabled"
                        />
                    </div>
                </div>
            </div>
        </template>

        <div :class="$style.divider" />

        <div :class="$style.actions">
            <Button @click="handleReset" type="secondary" size="small"
                >Reset filters</Button
            >
        </div>
    </div>
</template>

<style module>
.wrapper {
    position: sticky;
    top: 100px;

    background: var(--card-bg);
    border-radius: 8px;
    border: 1px solid var(--border);
    padding: 20px 0;
    height: fit-content;
}

.switcher {
    display: flex;

    margin: 0 20px 24px 20px;

    border-radius: 6px;
    outline: 1px solid var(--border);
}

.tab {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    width: 130px;
    height: 28px;
    cursor: pointer;

    font-size: 13px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-primary);

    opacity: 0.7;

    transition: all 0.2s ease;
}

.tab div {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--blue);
}

.tab:nth-child(1) {
    border-radius: 6px 0 0 6px;
}

.tab:nth-child(2) {
    border-radius: 0 6px 6px 0;
}

.tab.active {
    background: var(--opacity-05);
    opacity: 1;
}

.title {
    font-size: 14px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-primary);

    padding: 0 20px;
    margin-bottom: 24px;
}

.block {
    display: flex;
    flex-direction: column;
    gap: 12px;

    padding: 0 20px;
    margin-bottom: 32px;
}

.subtitle {
    display: flex;
    align-items: center;

    font-size: 12px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-tertiary);
    fill: var(--text-tertiary);
}

.subtitle svg {
    margin-left: 4px;
}

.hint {
    font-size: 12px;
    line-height: 1.6;
    font-weight: 500;
    color: var(--text-tertiary);

    padding: 0 20px;
    margin-bottom: 12px;
}

.divider {
    width: 100%;
    height: 1px;
    background: var(--border);

    margin: 20px 0 16px;
}

.actions {
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 0 20px;
}

.symbols {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.symbol_checkbox {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.symbol_checkbox span {
    color: var(--text-tertiary);
}

.badges {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
}

.badge {
    display: flex;
    align-items: center;
    gap: 8px;

    height: 32px;
    border: 1px solid var(--border);
    padding: 0 12px;
    border-radius: 50px;
    cursor: pointer;
    opacity: 0.5;

    font-size: 14px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-primary);
    fill: var(--text-tertiary);

    transition: all 0.2s ease;
}

.badge:hover {
    border: 1px solid var(--border-highlight);
}

.badge.active {
    opacity: 1;
}

.badge.yellow svg {
    fill: var(--yellow);
}

.badge.green svg {
    fill: var(--green);
}

.badge.red svg {
    fill: var(--red);
}

.badge.orange svg {
    fill: var(--orange);
}

.badge.gray svg {
    fill: var(--text-secondary);
}

.symbol img {
    width: 14px;
    height: 14px;
    border-radius: 50%;
}

.range_picker {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.range {
    position: relative;

    width: 100%;
    height: 4px;
    border-radius: 50px;
    background: var(--opacity-10);
}

.filled_range {
    position: absolute;

    height: 100%;
    background: var(--blue);
    border-radius: 50px;

    transition: all 0.2s ease;
}

.range_inputs {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.range_input {
    display: flex;
    align-items: center;

    cursor: text;

    height: 28px;
    border-radius: 6px;
    border: 1px solid var(--border);
    padding: 0 8px;

    transition: border 0.2s ease;
}

.range_input svg {
    fill: var(--text-tertiary);

    margin: 0 8px 0 0;
}

.range_input svg.reverse {
    fill: var(--text-tertiary);

    margin: 0 0 0 8px;

    transform: rotate(180deg);
}

.range_input input {
    width: 60px;

    font-size: 13px;
    line-height: 1.1;
    font-weight: 600;
    color: var(--text-primary);

    margin: 0 4px 0 0;
}

.range_input input.right {
    text-align: right;

    margin: 0 0 0 4px;
}

.range_input {
    font-size: 11px;
    line-height: 1.1;
    font-weight: 500;
    color: var(--text-tertiary);
}

.range_input input::-webkit-outer-spin-button,
.range_input input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.misc {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.toggle_filter {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.left {
    font-size: 14px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-primary);
}

.period {
    display: flex;
}

.period input {
    height: 32px;
    border: 1px solid var(--border);
    border-radius: 8px;

    font-size: 13px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-primary);

    padding: 0 10px;
}

.period input::-webkit-calendar-picker-indicator {
    display: none;
}

.avatar {
    width: 14px;
    height: 14px;
}
</style>
