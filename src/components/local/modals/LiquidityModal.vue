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

    setup(props, context) {
        const { event, show } = toRefs(props)

        const accountStore = useAccountStore()
        const notificationsStore = useNotificationsStore()

        /** Countdown setup */
        const { countdownText, status: countdownStatus, stop } = useCountdown(
            event,
        )

        /** User inputs */
        const amount = reactive({ value: 0, error: "" })
        const slippage = ref("3")
        const showCustomSlippage = ref(false)
        const availableSlippage = reactive(["0.5", "1", "3"])

        const selectSlippage = value => {
            slippage.value = value
        }
        const handleInputSlippage = e => {
            if (slippage.value > 30) {
                slippage.value = 30
            }
        }

        const sendingBet = ref(false)

        const liquidityRatio = computed(() => {
            const abRatio = event.value.pool_below / event.value.pool_above_eq
            const slippageMultiplier = 1 + slippage.value / 100

            return {
                min: abRatio / slippageMultiplier,
                max: abRatio * slippageMultiplier,
            }
        })
        const shares = computed(() => {
            const bigPool = Math.max(
                event.value.pool_below,
                event.value.pool_above_eq,
            )

            return (
                (event.value.total_liquidity_shares *
                    parseFloat(!amount.value ? 0 : amount.value)) /
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
            if (sendingBet.value) return "Accepting your liquidity.."

            if (!amount.value) return "Type the bet amount"
            if (amount.value) return "Provide liquidity"
        })

        const handleProvideLiquidity = () => {
            if (!amount.value) return
            if (countdownStatus.value !== "In progress") return

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
            showCustomSlippage,
            handleInputSlippage,
            availableSlippage,
            selectSlippage,
            sendingBet,
            liquidityRatio,
            shares,
            handleProvideLiquidity,
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
                :class="$style.preview"
            />

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
                side="Liquidity"
                :class="$style.pool"
            />

            <div :class="$style.stats">
                <Stat name="Slippage">
                    <div :class="$style.slippage_cfg">
                        <div
                            v-for="item in availableSlippage"
                            :key="item"
                            @click="selectSlippage(item)"
                            :class="[
                                $style.slippage,
                                slippage == item && $style.selected,
                            ]"
                        >
                            {{ item }}%
                        </div>

                        <input
                            type="number"
                            v-if="showCustomSlippage"
                            v-model="slippage"
                            @input="handleInputSlippage"
                            @keydown="
                                $event.key == '-' && $event.preventDefault()
                            "
                            placeholder="30%"
                        />
                        <Icon
                            @click="showCustomSlippage = !showCustomSlippage"
                            :name="showCustomSlippage ? 'close' : 'edit'"
                            size="12"
                            :class="$style.edit_slippage"
                        />
                    </div>
                </Stat>

                <Stat name="Reward for providing">
                    {{ event.liquidity_percent * 100 }}%
                </Stat>

                <Stat v-if="ratio" name="Ratio">
                    <Tooltip position="bottom" side="right">
                        <div :class="$style.ratio">
                            <Icon
                                name="close"
                                size="14"
                                :class="$style.cup_icon"
                            />{{ (1 + ratio).toFixed(2) }}
                        </div>

                        <template v-slot:content>
                            <span>Ratio after bet:</span>
                            {{ (1 + ratioAfterBet).toFixed(2) }}
                        </template>
                    </Tooltip>
                </Stat>

                <Stat v-if="liquidityRatio" name="Ratio"
                    ><Icon name="close" size="14" :class="$style.cup_icon" />{{
                        (1 + liquidityRatio.min).toFixed(2)
                    }}
                    - {{ (1 + liquidityRatio.max).toFixed(2) }}</Stat
                >

                <Stat name="Shares">
                    {{ shares.toFixed(0) }}
                </Stat>
            </div>

            <Button
                @click="handleProvideLiquidity"
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

.slippage_cfg {
    display: flex;
    align-items: center;
}

.slippage_cfg input {
    width: 40px;
    height: 22px;
    text-align: end;

    color: var(--text-primary);

    margin-left: 8px;
}

.slippage_cfg input::-webkit-outer-spin-button,
.slippage_cfg input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.edit_slippage {
    fill: var(--icon);
    padding: 4px;
    box-sizing: content-box;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    cursor: pointer;

    margin-left: 8px;

    transition: all 0.2s ease;
}

.edit_slippage:hover {
    background: rgba(255, 255, 255, 0.2);
}

.slippage {
    cursor: pointer;
    color: var(--text-tertiary);

    margin-left: 8px;

    transition: color 0.2s ease;
}

.slippage.selected {
    color: var(--blue);
}

.cup_icon {
    fill: var(--opacity-40);
}

.ratio {
    display: flex;
    align-items: center;
    gap: 4px;
}
</style>
