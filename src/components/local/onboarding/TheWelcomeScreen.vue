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
                title: "Getting Started",
                color: "blue",
                link: "/docs/getting-started",
            },
            {
                type: "Basic",
                title: "Explore Markets",
                color: "orange",
                link: "/docs/explore-markets",
            },
            {
                type: "Liquidity",
                title: "Earn as a provider",
                color: "green",
                link: "/docs/adding-liquidity",
            },
            {
                type: "Betting",
                title: "How to make a bet",
                color: "yellow",
                link: "/docs/how-to-bet",
            },
        ]

        const steps = reactive([
            {
                num: 1,
                name: "Explore Markets",
                readed: false,
            },
            {
                num: 2,
                name: "Symbol Page",
                readed: false,
            },
            {
                num: 3,
                name: "Selecting first Event",
                readed: false,
            },
            {
                num: 4,
                name: "Make a bet",
                readed: false,
            },
            {
                num: 4.1,
                name: "Provide a liquidity",
                readed: false,
            },
            {
                num: 5,
                name: "Withdraw",
                readed: false,
            },
        ])
        const currentStep = ref(0)
        const selectStep = num => {
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

            <img src="@/assets/logo.png" :class="$style.logo" />

            <div :class="$style.title">
                Hi, welcome to Juster ✌️
            </div>

            <div :class="$style.description">
                We will help you and tell you how to use our application, how to
                earn from providing liquidity, how to place bets correctly and
                much more.
            </div>

            <div :class="$style.block">
                <div :class="$style.block_title">Basic Guides</div>

                <div :class="$style.guides">
                    <GuideCard
                        v-for="guide in guides"
                        :key="guide.icon"
                        @click="handleSkip()"
                        :guide="guide"
                    />
                </div>
            </div>

            <div :class="$style.block">
                <div :class="$style.block_title">
                    Simple Flow of use
                </div>

                <div :class="$style.block_description">
                    All info can be found in the Juster Docs, but we have chosen
                    the main steps for you
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
                        On this page you can choose the currency pair you are
                        interested in or the top event. In the future, this page
                        can be customized for yourself. It also contains
                        important news affecting currency pairs.
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

                <!-- Symbol Page -->
                <div v-if="currentStep == 1" :class="$style.step">
                    <div :class="$style.step_title">Symbol Page</div>
                    <div :class="$style.step_description">
                        On this page you can choose the currency pair you are
                        interested in or the top event. In the future, this page
                        can be customized for yourself. It also contains
                        important news affecting currency pairs.
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

                <!-- Selecting first Event -->
                <div v-if="currentStep == 2" :class="$style.step">
                    <div :class="$style.step_title">Selecting first Event</div>
                    <div :class="$style.step_description">
                        On this page you can choose the currency pair you are
                        interested in or the top event. In the future, this page
                        can be customized for yourself. It also contains
                        important news affecting currency pairs.
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

                <!-- Make a bet -->
                <div v-if="currentStep == 3" :class="$style.step">
                    <div :class="$style.step_title">Make a bet</div>
                    <div :class="$style.step_description">
                        Having chosen a suitable event, you need to decide in
                        which direction the price will move. Depending on the
                        chosen direction, your winnings will vary. You can
                        double, triple your stake in just a couple of hours.
                    </div>
                    <div :class="$style.step_description">
                        After placing a bet and signing a transaction, you need
                        to wait about 30 seconds for us to accept your bet. Note
                        that you should definitely keep an eye on the event
                        timer.
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

                <!-- Provide a liquidity -->
                <div v-if="currentStep == 4" :class="$style.step">
                    <div :class="$style.step_title">Provide a liquidity</div>
                    <div :class="$style.step_description">
                        Having chosen a suitable event, you need to decide in
                        which direction the price will move. Depending on the
                        chosen direction, your winnings will vary. You can
                        double, triple your stake in just a couple of hours.
                    </div>
                    <div :class="$style.step_description">
                        After placing a bet and signing a transaction, you need
                        to wait about 30 seconds for us to accept your bet. Note
                        that you should definitely keep an eye on the event
                        timer.
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

                <!-- Withdraw -->
                <div v-if="currentStep == 5" :class="$style.step">
                    <div :class="$style.step_title">Withdraw</div>
                    <div :class="$style.step_description">
                        Having chosen a suitable event, you need to decide in
                        which direction the price will move. Depending on the
                        chosen direction, your winnings will vary. You can
                        double, triple your stake in just a couple of hours.
                    </div>
                </div>
            </div>

            <div :class="$style.onboarding_actions">
                <Button type="primary" size="medium" @click="$emit('skip')"
                    ><Icon name="spark" size="16" /> Start using Juster</Button
                >
                <Button type="secondary" size="medium" @click="handleOpenDocs"
                    ><Icon name="book" size="16" />
                    <span>Learn the</span> Juster Docs</Button
                >
            </div>

            <div :class="$style.hint">
                <Icon name="help" size="14" />
                All info can be found in the <span>Juster Docs</span>, plus
                details of the technical side of the project
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
    background: var(--app-background);
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
