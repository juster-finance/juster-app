<script setup>
/**
 * Base
 */
import Page from "@/components/base/Page"
</script>

<template>
    <Page>
        <h1>Sitemap</h1>

        <div :class="$style.block">
            <h3>General</h3>

            <ul>
                <li>
                    <a href="/">Explore</a>
                </li>
                <li>
                    <a href="/events">Events</a>
                </li>
                <li>
                    <a href="/markets">Markets</a>
                </li>
            </ul>
        </div>

        <div :class="$style.block">
            <h3>Markets</h3>

            <ul>
                <li>
                    <a href="/markets/XTZ-USD">Tezos</a>
                </li>
                <li>
                    <a href="/markets/ETH-USD">Ethereum</a>
                </li>
                <li>
                    <a href="/markets/BTC-USD">Bitcoin</a>
                </li>
            </ul>
        </div>

        <div :class="$style.block">
            <h3>Learn</h3>

            <ul>
                <li>
                    <a href="/">White Papper</a>
                </li>
                <li>
                    <a href="/docs">Documentation</a>
                </li>
                <li>
                    <a href="/docs/dev">Developers</a>
                </li>
                <li>
                    <a href="/docs/faq">FAQ</a>
                </li>
            </ul>
        </div>

        <div :class="$style.block">
            <h3>Legal</h3>

            <ul>
                <li>
                    <a href="/policy">Privacy Policy</a>
                </li>
                <li>
                    <a href="/terms">Terms of Use</a>
                </li>
            </ul>
        </div>
    </Page>
</template>

<style module>
.block {
    display: flex;
    flex-direction: column;
    gap: 20px;

    margin-top: 40px;
}

.block ul {
    display: flex;
    gap: 40px;

    padding-inline-start: 0;
    list-style-type: none;
}

.block li {
    font-size: 14px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-secondary);
}
</style>
