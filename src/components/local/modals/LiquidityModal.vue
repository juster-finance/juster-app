<script>
import { defineComponent, ref, reactive, computed, toRefs, watch } from "vue"
import BigNumber from "bignumber.js"

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
    name: "LiquidityModal",
    props: { show: Boolean, event: Object },
    emits: ["onClose"],

    setup(props, context) {
        const { event, show } = toRefs(props)

        const accountStore = useAccountStore()
        const notificationsStore = useNotificationsStore()

        /** Countdown setup */
        const eventStartTime = computed(() =>
            new Date(event.value?.betsCloseTime).getTime(),
        )
        const { countdownText, status: countdownStatus, stop } = useCountdown(
            eventStartTime,
        )

        /** User inputs */
        const amount = reactive({ value: 0, error: "" })
        const slippage = ref(2.5)

        const sendingBet = ref(false)

        const liquidityRatio = computed(() => {
            const abRatio = event.value.poolBelow / event.value.poolAboveEq
            const slippageMultiplier = 1 + slippage.value / 100

            return {
                min: abRatio / slippageMultiplier,
                max: abRatio * slippageMultiplier,
            }
        })
        const shares = computed(() => {
            const bigPool = Math.max(
                event.value.poolBelow,
                event.value.poolAboveEq,
            )

            return (
                (event.value.totalLiquidityShares *
                    (!amount.value ? 0 : amount.value)) /
                bigPool
            )
        })

        /** clear on close */
        watch(show, () => {
            if (!show.value) {
                amount.value = 0
                sendingBet.value = false
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
            if (countdownStatus.value !== "In progress")
                return "Acceptance of bets is closed"
            if (sendingBet.value) return "Awaiting confirmation.."

            if (amount.value > accountStore.balance) return "Insufficient funds"

            if (!amount.value) return "Type the liquidity amount"
            if (amount.value) return "Provide liquidity"
        })

        const handleProvideLiquidity = () => {
            if (!amount.value) return
            if (countdownStatus.value !== "In progress") return

            sendingBet.value = true
            juster
                .provideLiquidity(
                    event.value.id,
                    new BigNumber(event.value.poolAboveEq),
                    new BigNumber(event.value.poolBelow),
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
            amount,
            slippage,
            sendingBet,
            liquidityRatio,
            shares,
            handleProvideLiquidity,
            handleLogin,
            buttonText,
        }
    },

    emits: ["switch", "onClose"],
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
            <div :class="$style.title">Providing liquidity</div>

            <EventPreview
                :event="event"
                :countdown="countdownText"
                :status="countdownStatus"
                type="liquidity"
                @switch="$emit('switch')"
                :class="$style.preview"
            />

            <Input
                type="number"
                :limit="10000"
                label="Amount"
                placeholder="Liquidity amount"
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
                    >{{ accountStore.balance.toFixed(2) }}
                </span>

                XTZ
            </div>

            <SplittedPool
                :event="event"
                :amount="amount.value"
                side="Liquidity"
                :class="$style.pool"
            />

            <SlippageSelector
                v-model="slippage"
                :class="$style.slippage_block"
            />

            <div :class="$style.stats">
                <Stat name="Reward for providing">
                    {{ event.liquidityPercent * 100 }}%
                </Stat>

                <Stat v-if="liquidityRatio" name="Ratio"
                    ><Icon
                        name="close"
                        size="14"
                        :class="$style.ratio_icon"
                    />{{ (1 + liquidityRatio.min).toFixed(2) }} -
                    {{ (1 + liquidityRatio.max).toFixed(2) }}</Stat
                >
            </div>

            <Button
                @click="handleProvideLiquidity"
                size="large"
                type="primary"
                block
                :loading="sendingBet"
                :disabled="
                    !amount.value ||
                        countdownStatus !== 'In progress' ||
                        accountStore.balance < amount.value
                "
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
</style>
