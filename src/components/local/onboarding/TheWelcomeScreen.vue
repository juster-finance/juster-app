<script>
import { defineComponent, reactive, ref } from "vue"
import { useRouter } from "vue-router"

/**
 * Local
 */
import GuideCard from "./GuideCard"

/**
 * UI
 */
import Button from "@/components/ui/Button"

/**
 * Store
 */
import { useAccountStore } from "@/store/account"

export default defineComponent({
    name: "TheWelcomeScreen",

    setup(props, context) {
        const router = useRouter()

        const accountStore = useAccountStore()

        const guides = [
            {
                type: "Basic",
                title: "Connect wallet",
                color: "blue",
                link: "/docs/wallets",
            },
            {
                type: "Basic",
                title: "Explore markets",
                color: "orange",
                link: "/docs/explore-markets",
            },
            {
                type: "Basic",
                title: "Placing bets",
                color: "green",
                link: "/docs/how-to-bet",
            },
            {
                type: "Advanced",
                title: "Providing liquidity",
                color: "yellow",
                link: "/docs/adding-liquidity",
            },
        ]

        const steps = reactive([
            {
                num: 1,
                name: "Explore markets",
                readed: false,
            },
            {
                num: 2,
                name: "Сhoose an Event",
                readed: false,
            },
            {
                num: 3,
                name: "Connect your wallet",
                readed: false,
            },
            {
                num: 4,
                name: "Place a Bet",
                readed: false,
            },
            {
                num: 5,
                name: "Track the price",
                readed: false,
            },
            {
                num: 6,
                name: "Withdraw profit 🤑",
                readed: false,
            },
        ])
        const currentStep = ref(0)
        const selectStep = (num) => {
            if (num == currentStep.value) return

            const prevStep = currentStep.value
            currentStep.value = num

            steps.forEach((step, index) => {
                if (index == prevStep) {
                    step.readed = true
                }
            })
        }

        const handleOpenDocs = () => {
            accountStore.showOnboarding = false

            router.push("/docs")
            context.emit("skip")
        }

        const handleSkip = () => {
            accountStore.showOnboarding = false

            context.emit("skip")
        }

        return {
            guides,
            steps,
            currentStep,
            selectStep,
            handleOpenDocs,
            handleSkip,
        }
    },

    components: { GuideCard, Button },
})
</script>

<template>
    <div :class="$style.wrapper">
        <div :class="$style.base">
            <div @click="handleSkip()" :class="$style.skip_btn">
                Skip onboarding <Icon name="logout" size="14" />
            </div>

            <img src="@/assets/logo.png" :class="$style.logo" alt="logo" />

            <div :class="$style.title">Hi, welcome to Juster ✌️</div>

            <div :class="$style.description">
                Let us guide you through the main application pages and use case
                scenarios
            </div>

            <div :class="$style.block">
                <div :class="$style.block_title">Basic Workflow</div>

                <div :class="$style.block_description">
                    A step-by-step tutorial explaining how to work with Juster
                </div>

                <div :class="$style.flow_steps">
                    <div
                        v-for="(step, index) in steps"
                        :key="step.num"
                        @click="selectStep(index)"
                        :class="[
                            $style.flow_step,
                            index == currentStep && $style.active,
                        ]"
                    >
                        <span v-if="!step.readed">{{ step.num }}</span>
                        <Icon v-else name="checkcircle" size="14" />
                        {{ step.name }}
                    </div>
                </div>

                <!-- Explore Markets -->
                <div v-if="currentStep == 0" :class="$style.step">
                    <div :class="$style.step_title">Explore Markets</div>
                    <div :class="$style.step_description">
                        Currently Juster allows to bet on cryptocurrencies price
                        dynamics (in the future we will add more interesting
                        feeds) and at this point you can choose between
                        <i>XTZ/USD</i>, <i>ETH/USD</i>, and
                        <i>BTC/USD</i> depending on your goal (hedge existing
                        position, use the leverage, catch the trend, or other).
                    </div>

                    <div :class="$style.step_actions">
                        <Button
                            @click="selectStep(1)"
                            type="secondary"
                            size="small"
                            >Next step <Icon name="arrowright" size="16"
                        /></Button>
                    </div>
                </div>

                <!-- Choose Event -->
                <div v-if="currentStep == 1" :class="$style.step">
                    <div :class="$style.step_title">Choose an Event</div>
                    <div :class="$style.step_description">
                        Events are the core entities in Juster — they contain
                        the specification of two possible outcomes you can bet
                        on. They differ in the period of price measurement (e.g.
                        1 hour or 1 day) and the time left to the end of
                        accepting bets. <br />New events are created every time
                        the previous ones stop accepting bets, so there's always
                        at least one event available for betting.
                    </div>

                    <div :class="$style.step_actions">
                        <Button
                            @click="selectStep(2)"
                            type="secondary"
                            size="small"
                            >Next step <Icon name="arrowright" size="16"
                        /></Button>
                    </div>
                </div>

                <!-- Connect your wallet -->
                <div v-if="currentStep == 2" :class="$style.step">
                    <div :class="$style.step_title">Connect your wallet</div>
                    <div :class="$style.step_description">
                        If you click on "Bet" or "Liquidity" button on the Event
                        card Juster will first ask you to connect any Tezos
                        wallet, supporting Beacon. Make sure you have one and
                        enough funds for experimenting ;)
                    </div>

                    <div :class="$style.step_actions">
                        <Button
                            @click="selectStep(3)"
                            type="secondary"
                            size="small"
                            >Next step <Icon name="arrowright" size="16"
                        /></Button>
                    </div>
                </div>

                <!-- Place a bet -->
                <div v-if="currentStep == 3" :class="$style.step">
                    <div :class="$style.step_title">Place a bet</div>
                    <div :class="$style.step_description">
                        Decide whether in your opinion the price will rise or
                        fall (during the time frame specified in the event), put
                        the amount you want to risk, and send the order.<br />
                        Your bet will be confirmed in approximately 30 seconds
                        and you will be able see it in the "My bets" list on the
                        Event page.
                    </div>

                    <div :class="$style.step_actions">
                        <Button
                            @click="selectStep(4)"
                            type="secondary"
                            size="small"
                            >Next step <Icon name="arrowright" size="16"
                        /></Button>
                    </div>
                </div>

                <!-- Track the price -->
                <div v-if="currentStep == 4" :class="$style.step">
                    <div :class="$style.step_title">Track the price</div>
                    <div :class="$style.step_description">
                        The time for accepting bets ends and the starting price
                        is fixed. After that you can watch as the event tilts to
                        one or the other outcome until the final price is
                        settled. <br />Note that the price measurement may
                        happen with 1-2 blocks delay due to how price oracles
                        work.
                    </div>

                    <div :class="$style.step_actions">
                        <Button
                            @click="selectStep(5)"
                            type="secondary"
                            size="small"
                            >Next step <Icon name="arrowright" size="16"
                        /></Button>
                    </div>
                </div>

                <!-- Withdraw profit -->
                <div v-if="currentStep == 5" :class="$style.step">
                    <div :class="$style.step_title">Withdraw profit</div>
                    <div :class="$style.step_description">
                        Finally, if your bet win you can withdraw the deposited
                        amount plus gains to your wallet! Your personal stats is
                        available in the profile section as well as the list of
                        pending and completed withdrawals.
                    </div>
                </div>
            </div>

            <div :class="$style.block">
                <div :class="$style.block_title">Detailed guides</div>

                <div :class="$style.block_description">
                    Here are some useful links for the further reading
                </div>

                <div :class="$style.guides">
                    <GuideCard
                        v-for="guide in guides"
                        :key="guide.icon"
                        @click="handleSkip"
                        :guide="guide"
                    />
                </div>
            </div>

            <div :class="$style.onboarding_actions">
                <Button type="primary" size="medium" @click="handleSkip"
                    ><Icon name="spark" size="16" /> Start using Juster</Button
                >
                <Button type="secondary" size="medium" @click="handleOpenDocs"
                    ><Icon name="book" size="16" /> Read the Docs</Button
                >
            </div>

            <div :class="$style.hint">
                <Icon name="help" size="14" />
                You can always <span>return</span> to this window by clicking on
                the question icon on the navigation bar
            </div>
        </div>
    </div>
</template>

<style module>
.wrapper {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--app-bg);
    z-index: 2;

    display: flex;
    justify-content: center;
}

.base {
    max-width: 1080px;

    position: relative;
}

.base {
    overflow-y: auto;
}

.base::-webkit-scrollbar {
    display: none;
}

.skip_btn {
    position: absolute;
    top: 140px;
    right: 0;

    display: flex;
    align-items: center;
    gap: 8px;

    font-size: 14px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-tertiary);

    transition: color 0.2s ease;
}

.skip_btn svg {
    fill: var(--icon);
    transform: rotate(180deg);
}

.skip_btn:hover {
    color: var(--text-primary);
}

.logo {
    width: 32px;
    height: 32px;
    padding: 4px;
    background: #fff;
    border-radius: 8px;

    margin: 60px 0 40px;
}

.title {
    font-size: 40px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-primary);
    max-width: 600px;

    margin-bottom: 20px;
}

.description {
    font-size: 16px;
    line-height: 1.6;
    font-weight: 600;
    color: var(--text-tertiary);
    max-width: 600px;

    margin-bottom: 40px;
}

.block {
    margin-bottom: 40px;
}

.block_title {
    font-size: 16px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-primary);
}

.block_description {
    font-size: 14px;
    line-height: 1.6;
    font-weight: 500;
    color: var(--text-tertiary);

    margin: 8px 0 20px 0;
}

.guides {
    display: flex;
    align-items: center;
    justify-content: space-between;

    margin-top: 16px;
}

.flow_steps {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;

    margin-bottom: 12px;
}

.flow_step {
    display: flex;
    align-items: center;
    gap: 12px;

    cursor: pointer;
    background: var(--btn-secondary-bg);
    border-radius: 8px;
    border: 1px solid var(--border);
    height: 34px;
    padding: 0 14px;
    opacity: 0.4;

    font-size: 14px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-tertiary);

    transition: opacity 0.2s ease;
}

.flow_step svg {
    fill: var(--blue);
}

.flow_step.active {
    opacity: 1;
}

.flow_step span {
    color: var(--text-primary);
}

.flow_or {
    font-size: 16px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-tertiary);
}

.step {
    background: #191919;
    border-radius: 8px;
    padding: 24px;
    border: 1px solid var(--border);
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.15);
}

.step_title {
    font-size: 14px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-primary);

    margin-bottom: 8px;
}

.step_description {
    font-size: 14px;
    line-height: 1.6;
    font-weight: 500;
    color: var(--text-tertiary);

    margin-bottom: 24px;
}

.step_actions {
    display: flex;
    align-items: center;
    gap: 16px;
}

.onboarding_actions {
    display: flex;
    gap: 16px;
}

.hint {
    display: flex;
    align-items: center;

    font-size: 12px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-tertiary);

    margin: 20px 0 40px;
}

.hint svg {
    fill: var(--orange);

    margin-right: 8px;
}

.hint span {
    color: var(--text-secondary);
    margin: 0 5px;
}
</style>
