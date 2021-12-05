<script>
import {
    defineComponent,
    ref,
    reactive,
    computed,
    toRefs,
    watch,
    inject,
} from "vue"
import BigNumber from "bignumber.js"
import { estimateFeeMultiplier } from "@juster-finance/sdk"

/**
 * Services
 */
import { juster } from "@/services/tools"

/**
 * Local
 */
import EventPreview from "@/components/local/EventPreview"
import SplittedPool from "@/components/local/SplittedPool"
import SlippageSelector from "@/components/local/SlippageSelector"

/**
 * UI
 */
import Spin from "@/components/ui/Spin"
import Modal from "@/components/ui/Modal"
import Input from "@/components/ui/Input"
import Stat from "@/components/ui/Stat"
import Button from "@/components/ui/Button"
import Tooltip from "@/components/ui/Tooltip"

/**
 * Store
 */
import { useAccountStore } from "@/store/account"
import { useNotificationsStore } from "@/store/notifications"

/**
 * Composable
 */
import { useCountdown } from "@/composable/date"

export default defineComponent({
    name: "BetModal",
    props: { show: Boolean, event: Object },
    emits: ["onClose"],

    setup(props, context) {
        const { event, show } = toRefs(props)
        const amplitude = inject("amplitude")

        const accountStore = useAccountStore()
        const notificationsStore = useNotificationsStore()

        /** Countdown setup */
        const eventStartTime = computed(() =>
            new Date(event.value?.betsCloseTime).getTime(),
        )
        const {
            countdownText,
            status: countdownStatus,
            stop,
        } = useCountdown(eventStartTime)

        /** User inputs */
        const side = ref(null) /** pre-selected side */
        const amount = reactive({ value: 0, error: "" })
        const slippage = ref(2.5)

        const sendingBet = ref(false)

        /**
         * Ratio
         */
        const ratio = computed(() => {
            return {
                higher:
                    event.value.poolBelow /
                    (event.value.poolAboveEq + amount.value),
                lower:
                    event.value.poolAboveEq /
                    (event.value.poolBelow + amount.value),
            }
        })
        const ratioBeforeBet = computed(
            () =>
                (side.value == "Higher" &&
                    event.value.poolBelow / event.value.poolAboveEq) ||
                (side.value == "Lower" &&
                    event.value.poolAboveEq / event.value.poolBelow),
        )
        const ratioAfterBet = computed(
            () =>
                (side.value == "Higher" &&
                    (event.value.poolBelow - winDelta.value) /
                        (event.value.poolAboveEq + amount.value)) ||
                (side.value == "Lower" &&
                    (event.value.poolAboveEq - winDelta.value) /
                        (event.value.poolBelow + amount.value)),
        )

        const fee = computed(() =>
            estimateFeeMultiplier(
                {
                    betsCloseTime: new Date(event.value.betsCloseTime),
                    createdTime: new Date(event.value.createdTime),
                    liquidityPercent: event.value.liquidityPercent,
                },
                new Date(),
            ),
        )

        /** Reward */
        const winDelta = computed(() => {
            const selectedRatio =
                side.value == "Higher" ? ratio.value.higher : ratio.value.lower

            return amount.value * selectedRatio * (1 - fee.value)
        })
        const reward = computed(() => winDelta.value + amount.value)
        const minReward = computed(
            () => winDelta.value * (1 - slippage.value / 100) + amount.value,
        )

        // eslint-disable-next-line vue/return-in-computed-property
        const rewardText = computed(() => {
            if (!amount.value) {
                return 0
            }

            if (amount.value) {
                if (minReward.value == reward.value) {
                    return reward.value
                } else {
                    return `${minReward.value.toFixed(
                        2,
                    )} - ${reward.value.toFixed(2)}`
                }
            }
        })

        const selectTab = (tab) => {
            side.value = tab
        }

        /** clear on close */
        watch(show, () => {
            if (!show.value) {
                side.value = null
                amount.value = 0

                stop()
            } else {
                accountStore.updateBalance()
            }
        })

        watch(amount, () => {
            if (!amount.value) amount.value = ""
        })

        // eslint-disable-next-line vue/return-in-computed-property
        const buttonState = computed(() => {
            if (!side.value) {
                return { text: "Select your submission", disabled: true }
            }

            if (countdownStatus.value !== "In progress")
                return { text: "Acceptance of bets is closed", disabled: true }
            if (sendingBet.value)
                return { text: "Awaiting confirmation..", disabled: true }

            if (amount.value > accountStore.balance)
                return { text: "Insufficient funds", disabled: true }

            switch (side.value) {
                case "Higher":
                case "Lower":
                    if (!amount.value)
                        return { text: "Select the bet amount", disabled: true }
                    if (amount.value)
                        return { text: "Place a bet", disabled: false }
            }
        })

        const handleBet = () => {
            if (!amount.value) return
            if (countdownStatus.value !== "In progress") return

            let betType
            if (side.value == "Higher") betType = "aboveEq"
            if (side.value == "Lower") betType = "below"

            sendingBet.value = true

            juster
                .bet(
                    event.value.id,
                    betType,
                    BigNumber(amount.value),
                    BigNumber(minReward.value),
                )
                .then((op) => {
                    sendingBet.value = false

                    /** slow notification to get attention */
                    setTimeout(() => {
                        notificationsStore.create({
                            notification: {
                                type: "success",
                                title: "Your bet has been accepted",
                                description:
                                    "We need to process your bet, it will take ~30 seconds",
                                autoDestroy: true,
                            },
                        })
                    }, 700)

                    /** analytics */
                    amplitude.logEvent("onBet")

                    context.emit("onBet", {
                        side: betType == "aboveEq" ? "ABOVE_EQ" : "BELOW",
                        amount: amount.value,
                        reward: minReward.value,
                    })
                })
                .catch((err) => {
                    sendingBet.value = false
                })
        }

        /** Login */
        const handleLogin = async () => {
            await juster.sync()
            juster.getPkh().then((pkh) => {
                accountStore.setPkh(pkh)
            })

            context.emit("onClose")
        }

        return {
            accountStore,
            countdownText,
            countdownStatus,
            selectTab,
            side,
            amount,
            slippage,
            sendingBet,
            winDelta,
            ratio,
            ratioBeforeBet,
            ratioAfterBet,
            fee,
            rewardText,
            handleBet,
            handleLogin,
            buttonState,
        }
    },

    emits: ["switch", "onClose", "onBet"],
    components: {
        Modal,
        Input,
        Stat,
        Button,
        Spin,
        Tooltip,
        EventPreview,
        SplittedPool,
        SlippageSelector,
    },
})
</script>

<template>
    <Modal
        :show="show"
        width="500"
        padding="32px 32px 24px 32px"
        closable
        @onClose="$emit('onClose')"
    >
        <template v-if="accountStore.isLoggined">
            <div :class="$style.title">Place a bet</div>

            <EventPreview
                :event="event"
                :countdown="countdownText"
                :status="countdownStatus"
                type="bet"
                @switch="$emit('switch')"
                :class="$style.preview"
            />

            <div :class="$style.subtitle">The price will</div>

            <div :class="$style.tabs">
                <div
                    @click="selectTab('Higher')"
                    :class="[$style.tab, side == 'Higher' && $style.higher]"
                >
                    <div :class="$style.tab_left">
                        <Icon name="higher" size="16" />Rise
                    </div>
                    <div :class="$style.tab_ratio">
                        <Icon name="close" size="10" />
                        {{ (1 + ratio.higher).toFixed(2) }}
                    </div>
                </div>
                <div
                    @click="selectTab('Lower')"
                    :class="[$style.tab, side == 'Lower' && $style.lower]"
                >
                    <div :class="$style.tab_ratio">
                        <Icon name="close" size="10" />
                        {{ (1 + ratio.lower).toFixed(2) }}
                    </div>

                    <div :class="$style.tab_left">
                        <Icon name="lower" size="16" />Fall
                    </div>
                </div>
            </div>

            <template v-if="side">
                <Input
                    type="number"
                    :limit="10000"
                    label="Amount"
                    placeholder="Bet amount"
                    subtext="XTZ"
                    v-model="amount.value"
                    :error="amount.error"
                    @clearError="amount.error = ''"
                    :class="$style.amount_input"
                />

                <div :class="$style.balance">
                    Available balance
                    <span
                        @click="amount.value = Math.floor(accountStore.balance)"
                        @dblclick="amount.value = accountStore.balance / 2"
                        >{{ accountStore.balance }}
                    </span>

                    XTZ
                </div>

                <SplittedPool
                    :event="event"
                    :amount="amount.value"
                    :winDelta="winDelta"
                    :side="side"
                    :class="$style.pool"
                />

                <SlippageSelector
                    v-model="slippage"
                    :class="$style.slippage_block"
                />

                <div :class="$style.stats">
                    <Stat name="Reward">
                        {{ rewardText }}
                        <span>XTZ</span></Stat
                    >
                </div>
            </template>

            <Button
                @click="handleBet"
                size="large"
                :type="buttonState.disabled ? 'secondary' : 'primary'"
                block
                :loading="sendingBet"
                :disabled="buttonState.disabled"
            >
                <Spin v-if="sendingBet" size="16" />
                <Icon
                    v-else
                    :name="
                        countdownStatus == 'In progress' && amount.value
                            ? 'bolt'
                            : 'lock'
                    "
                    size="16"
                />{{ buttonState.text }}</Button
            >
        </template>

        <template v-else>
            <div :class="$style.title">Place a bet</div>
            <div :class="$style.description">
                To fully interact with the application, you need to create an
                account and connect Temple wallet
            </div>

            <Button @click="handleLogin" size="large" type="primary" block
                ><Icon name="login" size="16" />Sign in to continue</Button
            >
        </template>
    </Modal>
</template>

<style module>
.wrapper {
}

.title {
    font-size: 20px;
    font-weight: 600;
    line-height: 1.2;
    color: var(--text-primary);

    margin-bottom: 24px;
}

.preview {
    margin-bottom: 24px;
}

.description {
    font-size: 14px;
    line-height: 1.6;
    font-weight: 500;
    color: var(--text-tertiary);

    margin-bottom: 24px;
}

.subtitle {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-secondary);

    margin-bottom: 12px;
}

.tabs {
    display: flex;
    justify-content: space-between;
    gap: 8px;

    margin-bottom: 24px;
}

.tab {
    display: flex;
    justify-content: space-between;
    align-items: center;

    font-size: 14px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-primary);

    background: var(--btn-secondary-bg);
    border-radius: 8px;
    width: 100%;
    height: 42px;
    padding: 14px;

    transition: all 0.15s ease;
}

.tab:hover {
    background: var(--btn-secondary-bg-hover);
}

.tab_left {
    display: flex;
    align-items: center;
    gap: 6px;
}

.tab_ratio {
    display: flex;
    align-items: center;
    gap: 2px;

    font-size: 12px;
    line-height: 1;
    font-weight: 700;
    color: var(--text-tertiary);
    fill: var(--text-tertiary);
}

.tab_left svg {
    fill: var(--text-white);
    transition: fill 0.15s ease;
}

.tab.higher {
    background: var(--green);
    color: var(--text-black);
}

.tab.higher .tab_left svg {
    fill: var(--text-black);
}

.tab.higher .tab_ratio {
    color: rgba(0, 0, 0, 0.6);
    fill: rgba(0, 0, 0, 0.6);
}

.tab.lower {
    background: var(--orange);
    color: var(--text-black);
}

.tab.lower .tab_left svg {
    fill: var(--text-black);
}

.tab.lower .tab_ratio {
    color: rgba(0, 0, 0, 0.6);
    fill: rgba(0, 0, 0, 0.6);
}

.amount_input {
    margin-bottom: 8px;
}

.balance {
    font-size: 12px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-tertiary);

    margin-bottom: 24px;
}

.balance span {
    cursor: pointer;
    color: var(--text-secondary);
}

.pool {
    margin-bottom: 24px;
}

.stats {
    display: flex;
    flex-direction: column;
    gap: 8px;

    margin-bottom: 24px;
}

.slippage_block {
    margin-bottom: 24px;
}

.ratio_icon {
    fill: var(--opacity-40);
}

.ratio {
    display: flex;
    align-items: center;
    gap: 4px;
}
</style>
