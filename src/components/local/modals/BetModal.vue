<script>
import { defineComponent, ref, reactive, computed, toRefs, watch } from "vue"
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
import SplippageSelector from "@/components/local/SlippageSelector"

/**
 * UI
 */
import Modal from "@/components/ui/Modal"
import Input from "@/components/ui/Input"
import Stat from "@/components/ui/Stat"
import Button from "@/components/ui/Button"
import Spin from "@/components/ui/Spin"
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

    setup(props, context) {
        const { event, show } = toRefs(props)

        const accountStore = useAccountStore()
        const notificationsStore = useNotificationsStore()

        /** Countdown setup */
        const { countdownText, status: countdownStatus, stop } = useCountdown(
            event,
        )

        /** User inputs */
        const side = ref(null) /** pre-selected side */
        const amount = reactive({ value: 0, error: "" })
        const slippage = ref(2.5)

        const sendingBet = ref(false)

        /**
         * Ratio
         */
        const ratio = computed(
            () =>
                (side.value == "Higher" &&
                    event.value.pool_below /
                        (event.value.pool_above_eq + amount.value)) ||
                (side.value == "Lower" &&
                    event.value.pool_above_eq /
                        (event.value.pool_below + amount.value)),
        )
        const ratioBeforeBet = computed(
            () =>
                (side.value == "Higher" &&
                    event.value.pool_below / event.value.pool_above_eq) ||
                (side.value == "Lower" &&
                    event.value.pool_above_eq / event.value.pool_below),
        )
        const ratioAfterBet = computed(
            () =>
                (side.value == "Higher" &&
                    (event.value.pool_below - winDelta.value) /
                        (event.value.pool_above_eq + amount.value)) ||
                (side.value == "Lower" &&
                    (event.value.pool_above_eq - winDelta.value) /
                        (event.value.pool_below + amount.value)),
        )

        const fee = computed(() =>
            estimateFeeMultiplier(
                {
                    betsCloseTime: new Date(event.value.bets_close_time),
                    createdTime: new Date(event.value.created_time),
                    liquidityPercent: event.value.liquidity_percent,
                },
                new Date(),
            ),
        )

        /** Reward */
        const winDelta = computed(() =>
            (amount.value * ratio.value * (1 - fee.value)).toFixed(2),
        )
        const reward = computed(
            () => parseFloat(winDelta.value) + parseFloat(amount.value),
        )
        const minReward = computed(
            () =>
                parseFloat(winDelta.value) * (1 - slippage.value / 100) +
                parseFloat(amount.value),
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

        const selectTab = tab => {
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
        const buttonText = computed(() => {
            if (!side.value) {
                return "Select your submission"
            }

            if (countdownStatus.value !== "In progress")
                return "Acceptance of bets is closed"
            if (sendingBet.value) return "Accepting your bet.."

            switch (side.value) {
                case "Liquidity":
                    if (!amount.value) return "Type the bet amount"
                    if (amount.value) return "Provide"

                case "Higher":
                case "Lower":
                    if (!amount.value) return "Type the bet amount"
                    if (amount.value) return "Place a bet"
            }
        })

        const handleBet = () => {
            if (!amount.value) return
            if (countdownStatus.value !== "In progress") return

            if (side.value == "Liquidity") {
                sendingBet.value = true
                juster
                    .provideLiquidity(
                        event.value.id,
                        new BigNumber(event.value.pool_above_eq),
                        new BigNumber(event.value.pool_below),
                        new BigNumber(slippage.value / 100),
                        new BigNumber(amount.value),
                    )
                    .then(op => {
                        sendingBet.value = false

                        /** slow notification to get attention */
                        setTimeout(() => {
                            notificationsStore.create({
                                notification: {
                                    type: "success",
                                    title: "Your liquidity has been accepted",
                                    description:
                                        "We need to process your bet, it will take ~30 seconds",
                                    autoDestroy: true,
                                },
                            })
                        }, 700)

                        context.emit("onClose")
                    })
                    .catch(err => console.log(err))
            } else {
                let betType
                if (side.value == "Higher") betType = "aboveEq"
                if (side.value == "Lower") betType = "below"
                if (side.value == "Liquidity") return

                sendingBet.value = true
                juster
                    .bet(
                        event.value.id,
                        betType,
                        BigNumber(amount.value),
                        BigNumber(minReward.value),
                    )
                    .then(op => {
                        console.log(`H: ${op.opHash}`)
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

                        context.emit("onClose")
                    })
                    .catch(err => {
                        sendingBet.value = false
                    })
            }
        }

        /** Login */
        const handleLogin = async () => {
            await juster.sync()
            juster.getPkh().then(pkh => {
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
            ratio,
            ratioBeforeBet,
            ratioAfterBet,
            fee,
            rewardText,
            handleBet,
            handleLogin,
            buttonText,
        }
    },

    components: {
        Modal,
        Input,
        Stat,
        Button,
        Spin,
        Tooltip,
        EventPreview,
        SplittedPool,
        SplippageSelector,
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
                :class="$style.preview"
            />

            <div :class="$style.subtitle">The price will</div>

            <div :class="$style.tabs">
                <div
                    @click="selectTab('Higher')"
                    :class="[$style.tab, side == 'Higher' && $style.higher]"
                >
                    <Icon name="higher" size="16" />Rise
                </div>
                <div
                    @click="selectTab('Lower')"
                    :class="[$style.tab, side == 'Lower' && $style.lower]"
                >
                    <Icon name="lower" size="16" />Fall
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
                        @click="amount.value = accountStore.balance"
                        @dblclick="amount.value = accountStore.balance / 2"
                        >{{ accountStore.balance.toFixed(2) }}
                    </span>

                    XTZ
                </div>

                <SplittedPool
                    :event="event"
                    :amount="amount.value"
                    :side="side"
                    :class="$style.pool"
                />

                <SplippageSelector
                    v-model="slippage"
                    :class="$style.slippage_block"
                />

                <div :class="$style.stats">
                    <Stat
                        v-if="side == 'Liquidity'"
                        name="Reward for providing"
                    >
                        {{ event.liquidity_percent * 100 }}%
                    </Stat>

                    <Stat v-if="ratio" name="Ratio">
                        <Tooltip position="bottom" side="right">
                            <div :class="$style.ratio">
                                <Icon
                                    name="close"
                                    size="14"
                                    :class="$style.ratio_icon"
                                />{{ (1 + ratio).toFixed(2) }}
                            </div>

                            <template v-slot:content>
                                <span>Ratio after bet:</span>
                                {{ (1 + ratioAfterBet).toFixed(2) }}
                            </template>
                        </Tooltip>
                    </Stat>

                    <Stat name="Reward">
                        {{ rewardText }}
                        <span>XTZ</span></Stat
                    >
                </div>
            </template>

            <Button
                @click="handleBet"
                size="large"
                type="primary"
                block
                :loading="sendingBet"
                :disabled="!amount.value || countdownStatus !== 'In progress'"
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
                />{{ buttonText }}</Button
            >

            <div :class="$style.hint">
                The commission for the bet depends on the time before the start
                of the calculation. Fee: {{ (fee * 100).toFixed(2) }}%
            </div>
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
    color: var(--text-tertiary);

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
    justify-content: center;
    align-items: center;
    gap: 8px;

    font-size: 14px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-primary);

    background: var(--btn-secondary-bg);
    border-radius: 8px;
    width: 100%;
    height: 44px;

    transition: all 0.15s ease;
}

.tab:hover {
    background: var(--btn-secondary-bg-hover);
}

.tab svg {
    fill: var(--text-white);
    transition: fill 0.15s ease;
}

.tab.higher {
    background: var(--green);
    color: var(--text-black);
}

.tab.higher svg {
    fill: var(--text-black);
}

.tab.lower {
    background: var(--orange);
    color: var(--text-black);
}

.tab.lower svg {
    fill: var(--text-black);
}

.tab.liquidity {
    background: var(--blue);
    color: var(--text-black);
}

.tab.liquidity svg {
    fill: var(--text-black);
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

.hint {
    font-size: 13px;
    font-weight: 500;
    line-height: 1.6;
    color: var(--text-tertiary);
    text-align: center;
    max-width: 330px;

    margin: 0 auto;
    margin-top: 16px;
}
</style>
