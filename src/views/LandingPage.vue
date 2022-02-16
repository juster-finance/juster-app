<script>
/**
 * Base
 */
import Page from "@/components/base/Page"

/**
 * UI
 */
import Button from "@/components/ui/Button"

export default {
    name: "LandingPage",

    components: { Page, Button },
}
</script>

<template>
    <Page :class="$style.wrapper">
        <div :class="$style.header">
            <!-- <a
                href="https://verbose-krill-7ef.notion.site/Juster-Roadmap-786c58fbd0a8435994d2890202c0ddbf"
                target="_blank"
                :class="$style.roadmap"
            >
                <Icon name="map" size="16" />

                <div :class="$style.roadmap_name">
                    First Step — <span>MVP</span>
                </div>

                <div :class="$style.dot" />

                <div :class="$style.roadmap_link">View our Roadmap</div>
            </a>-->

            <h1>Decentralized Betting Protocol</h1>
            <div :class="$style.description">
                <span>Juster</span> is an on-chain smart contract platform
                allowing users to take part in an automated betting market by
                creating events, providing liquidity to them, and making bets.
            </div>

            <div :class="$style.buttons">
                <router-link to="/">
                    <Button type="primary" size="medium">
                        <Icon name="spark" size="16" />Launch Juster app
                    </Button>
                </router-link>
                <router-link to="/docs">
                    <Button type="secondary" size="medium">
                        <Icon name="book" size="16" />Read the docs
                    </Button>
                </router-link>
            </div>

            <div :class="$style.promo">
                <div :class="$style.promo_video">
                    <iframe
                        width="560"
                        height="315"
                        src="https://www.youtube.com/embed/rOYu2Qpbpdw?controls=0&modestbranding=1&rel=0"
                        title="Juster promo"
                        frameborder="0"
                        allow
                        allowfullscreen
                    ></iframe>
                </div>
            </div>

            <!-- <img
                src="@/assets/landing/app.png"
                width="1100"
                height="734"
                :class="$style.app_img"
            />-->

            <div :class="$style.hint">
                <Icon name="help" size="14" />Juster is built on
                <span>Tezos</span> blockchain and uses
                <span>Harbinger</span> oracle price feed
            </div>
        </div>

        <!-- <div :class="$style.block">
            <div :class="$style.benefits">
                <div :class="$style.benefit">
                    <img src="@/assets/landing/benefit_1.svg" />

                    <div :class="$style.benefit_name">
                        Transparent platform
                    </div>
                    <div :class="$style.benefit_description">
                        A platform based on a smart contract and aimed not at
                        profit, but at users
                    </div>
                </div>
                <div :class="$style.benefit">
                    <img src="@/assets/landing/benefit_2.svg" />

                    <div :class="$style.benefit_name">
                        Built for speed
                    </div>
                    <div :class="$style.benefit_description">
                        No waiting or spinners, use the app on the fly from your
                        PC or phone
                    </div>
                </div>
                <div :class="$style.benefit">
                    <img src="@/assets/landing/benefit_3.svg" />

                    <div :class="$style.benefit_name">
                        Lowest commission
                    </div>
                    <div :class="$style.benefit_description">
                        Our commissions range 0% - 0.9% and will never grow
                        higher
                    </div>
                </div>
            </div>
        </div>

        <div :class="$style.block">
            <h2>Three easy steps</h2>
            <p>
                Immediately after logging into your account, you can use the
                <span>Explore page</span>. Choose among the top events or on the
                currency pair page.
            </p>

            <div :class="$style.hint">
                <Icon name="help" size="14" />Please note that the closer the
                event starts, the higher the commission
            </div>

            <div :class="$style.steps">
                <div :class="$style.step">
                    <div :class="$style.step_img">
                        <img src="@/assets/landing/step_1.svg" />
                    </div>

                    <div :class="$style.step_base">
                        <div :class="$style.step_name">
                            1 <span>Choose an event</span>
                        </div>

                        <div :class="$style.step_description">
                            Based on the analysis or your preferences, choose an
                            event for a specific currency pair
                        </div>
                    </div>
                </div>
                <div :class="$style.step">
                    <div :class="$style.step_img">
                        <img src="@/assets/landing/step_2.svg" />
                    </div>

                    <div :class="$style.step_base">
                        <div :class="$style.step_name">
                            2 <span>Make a bet</span>
                        </div>

                        <div :class="$style.step_description">
                            Choose the amount (about <span>5%</span> of the
                            balance) and place a bet on the desired event
                        </div>
                    </div>
                </div>
                <div :class="$style.step">
                    <div :class="$style.step_img">
                        <img src="@/assets/landing/step_3.svg" />
                    </div>

                    <div :class="$style.step_base">
                        <div :class="$style.step_name">
                            3 <span>Win & Withdraw</span>
                        </div>

                        <div :class="$style.step_description">
                            For the won event, get a reward and make an instant
                            withdrawal without expectations
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div :class="$style.block">
            <h2>The right approach to betting</h2>
            <p>
                Immediately after logging into your account, you can use the
                <span>Explore page</span>. Choose among the top events or on the
                currency pair page.
            </p>
            <p>
                Immediately after logging into your account, you can use the
                <span>Explore page</span>. Choose among the top events or on the
                currency pair page.
            </p>

            <div :class="$style.stats">
                <div :class="$style.stat">
                    <div :class="$style.line">
                        <div :class="$style.highlight" />
                    </div>

                    <div :class="$style.stat_value">12+</div>
                    <div :class="$style.stat_description">
                        currency pairs currently available for betting
                    </div>
                </div>
                <div :class="$style.stat">
                    <div :class="$style.line">
                        <div :class="$style.highlight" />
                    </div>

                    <div :class="$style.stat_value">0 <span>—</span> 0.9%</div>
                    <div :class="$style.stat_description">
                        low commissions throughout the event
                    </div>
                </div>
                <div :class="$style.stat">
                    <div :class="$style.line">
                        <div :class="$style.highlight" />
                    </div>

                    <div :class="$style.stat_value"><span>~</span>15 sec</div>
                    <div :class="$style.stat_description">
                        minimum amount of time to accept your bet
                    </div>
                </div>
                <div :class="$style.stat">
                    <div :class="$style.line">
                        <div :class="$style.highlight" />
                    </div>

                    <div :class="$style.stat_value">3</div>
                    <div :class="$style.stat_description">
                        time periods available for events (1h, 6h, 24h)
                    </div>
                </div>
            </div>

            <div :class="$style.hint">
                <Icon name="help" size="14" />Please note that the closer the
                event starts, the higher the commission
            </div>
        </div>

        <div :class="$style.block">
            <h2>Key features</h2>
            <p>
                Immediately after logging into your account, you can use the
                Explore page. Choose among the top events or on the currency
                pair page.
            </p>

            <div :class="$style.features">
                <div :class="[$style.feat, $style.small]">
                    <div :class="$style.feat_subtitle">Monitoring</div>
                    <div :class="$style.feat_title">
                        Watch event changes in real time.
                        <span
                            >We will show you all the information you need to
                            track the result.</span
                        >
                    </div>

                    <img
                        src="@/assets/landing/feat_1.png"
                        width="413"
                        height="246"
                    />
                </div>
                <div :class="[$style.feat, $style.large]">
                    <div :class="$style.feat_subtitle">Details</div>
                    <div :class="$style.feat_title">
                        All the information you need at a glance.
                        <span
                            >Don't waste time looking for the right event, we
                            have placed all the necessary information in a
                            compact format & Quick bet with the Join
                            button.</span
                        >
                    </div>

                    <img src="@/assets/landing/feat_2.png" height="215" />
                </div>
            </div>
            <div :class="$style.features">
                <div :class="[$style.feat, $style.large]">
                    <div :class="$style.feat_subtitle">Discussions</div>
                    <div :class="$style.feat_title">
                        Chat with other users
                        <span
                            >and discuss the possible outcome of the event. Be
                            careful, other users may be wrong. By placing a bet,
                            you risk your own funds. Pay attention to the number
                            of likes under the post.</span
                        >
                    </div>

                    <img src="@/assets/landing/feat_3.png" height="223" />
                </div>
                <div :class="[$style.feat, $style.small]">
                    <div :class="$style.feat_subtitle">Filters</div>
                    <div :class="$style.feat_title">
                        Quickly search for events using filters.
                        <span
                            >You can filter events by status, amount of
                            liquidity, TVL, etc.</span
                        >
                    </div>
                    <div :class="$style.feat_title">
                        Quickly search for events using filters.
                        <span
                            >You can filter events by status, amount of
                            liquidity, TVL, etc.</span
                        >
                    </div>

                    <img src="@/assets/landing/feat_4.png" height="74" />
                </div>
            </div>

            <div :class="$style.hint">
                <Icon name="help" size="14" />
                Other users can manipulate your opinion in
                <span>Discussions</span>to influence the event ratio
            </div>
        </div>

        <div :class="$style.block">
            <h2>Are you ready?</h2>
            <p>
                Immediately after logging into your account, you can use the
                Explore page. Choose among the top events or on the currency
                pair page.
            </p>

            <div :class="$style.buttons">
                <router-link to="/"
                    ><Button type="primary" size="medium"
                        ><Icon name="spark" size="16" />Explore the
                        Juster</Button
                    ></router-link
                >
                <router-link to="/docs">
                    <Button type="secondary" size="medium"
                        ><Icon name="book" size="16" />Learn the Juster
                        Docs</Button
                    ></router-link
                >
            </div>
        </div>-->
    </Page>
</template>

<style module>
.wrapper {
    max-width: 1170px;
    min-width: 1170px;
    margin: 0 auto;
}

.wrapper h1 {
    font-size: 48px;
    line-height: 1.4;
    font-weight: 600;
    text-align: center;

    max-width: 800px;

    margin-bottom: 16px;
}

.header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 150px;
}

.roadmap {
    display: flex;
    align-items: center;
    gap: 12px;
    border-radius: 50px;
    background: #141414;
    border: 1px solid var(--border);
    box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.5);

    padding: 0 12px;
    height: 36px;
    margin: 60px 0 32px;

    transition: border 0.2s ease;
}

.roadmap:hover {
    border: 1px solid var(--border-highlight);
}

.roadmap svg {
    fill: var(--opacity-40);
}

.roadmap_name {
    font-size: 14px;
    line-height: 1.4;
    font-weight: 600;
    color: var(--text-tertiary);
}

.roadmap_name span {
    color: var(--text-secondary);
}

.dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--border);
}

.roadmap_link {
    font-size: 14px;
    line-height: 1.4;
    font-weight: 600;
    color: var(--blue);
}

.description {
    font-size: 18px;
    line-height: 1.6;
    font-weight: 400;
    color: var(--text-tertiary);
    text-align: center;

    max-width: 600px;

    margin-bottom: 40px;
}

.description span {
    color: var(--text-secondary);
}

.buttons {
    display: flex;
    gap: 16px;
}

.promo {
    margin-top: 50px;
    margin-bottom: 20px;
}

.promo_video {
    position: relative;
    padding-bottom: 56.25%;
    background: #1b1b1b;
    height: 0;
    border-radius: 5px;
    overflow: hidden;
    box-shadow: 0px 1px 10px rgba(0, 0, 0, 0.7);
}

.app_img {
    margin-top: 40px;
}

.hint {
    display: flex;
    align-items: center;

    font-size: 12px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-tertiary);
}

.hint svg {
    fill: var(--opacity-40);

    margin-right: 8px;
}

.hint span {
    color: var(--text-secondary);
    margin: 0 5px;
}

.block {
    margin-bottom: 140px;
}

.block h2 {
    font-size: 32px;

    margin-bottom: 20px;
}

.block p {
    font-size: 16px;
    line-height: 1.6;
    font-weight: 500;
    color: var(--text-tertiary);

    max-width: 550px;

    margin-bottom: 20px;
}

.block p:last-child {
    margin-bottom: 0;
}

.block p span {
    color: var(--text-secondary);
}

.benefits {
    display: flex;
    justify-content: space-between;
}

.benefit {
    max-width: 260px;
}

.benefit_name {
    font-size: 16px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-primary);

    margin: 16px 0 8px;
}

.benefit_description {
    font-size: 14px;
    line-height: 1.6;
    font-weight: 500;
    color: var(--text-tertiary);
}

.steps {
    display: flex;
    justify-content: space-between;

    margin-top: 40px;
}

.step {
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    border-radius: 10px;
    border: 1px solid var(--border);
    padding: 20px;
    background: var(--card-background);
    width: 370px;
    height: 252px;

    transition: border 0.2s ease;
}

.step:hover {
    border: 1px solid var(--border-highlight);
}

.step_img {
    display: flex;
    align-items: center;
    justify-content: center;

    height: 104px;
}

.step_base {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.step_name {
    font-size: 16px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-tertiary);

    display: flex;
    gap: 12px;
}

.step_name span {
    color: var(--text-primary);
}

.step_description {
    font-size: 14px;
    line-height: 1.6;
    font-weight: 500;
    color: var(--text-tertiary);
}

.step_description span {
    color: var(--text-secondary);
}

.stats {
    display: flex;
    justify-content: space-between;

    margin: 50px 0;
}

.stat {
    position: relative;
    max-width: 260px;
}

.line {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;

    width: 1px;
    background: var(--border);
}

.highlight {
    width: 2px;
    height: 24px;
    background: var(--blue);
}

.stat_value {
    font-size: 24px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-primary);

    margin-left: 20px;
    margin-bottom: 8px;
}

.stat_value span {
    color: var(--text-tertiary);
}

.stat_description {
    font-size: 16px;
    line-height: 1.5;
    font-weight: 500;
    color: var(--text-tertiary);

    margin-left: 20px;
}

.features {
    display: flex;
    justify-content: space-between;
    gap: 32px;

    margin-bottom: 32px;
}

.feat {
    height: 400px;
    border-radius: 16px;
    border: 1px solid var(--border);
    background: var(--card-background);
    padding: 24px;
    overflow: hidden;
}

.feat.small {
    width: 440px;
}

.feat.large {
    flex: 1;
}

.feat_subtitle {
    font-size: 14px;
    line-height: 1;
    font-weight: 700;
    color: var(--blue);

    margin-bottom: 16px;
}

.feat_title {
    font-size: 18px;
    line-height: 1.4;
    font-weight: 600;
    color: var(--text-primary);

    margin-bottom: 24px;
}

.feat_title span {
    color: var(--text-tertiary);
}
</style>
