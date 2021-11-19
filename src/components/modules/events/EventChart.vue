<script>
import { defineComponent, ref } from "vue"

/**
 * Charts
 */
import EventPriceChart from "./charts/EventPriceChart"
import EventTVLChart from "./charts/EventTVLChart"

export default defineComponent({
    name: "EventChart",
    props: { event: Object },

    setup() {
        const isOpen = ref(true)

        const selectedTab = ref("Price")
        const tabs = ref(["Price", "TVL"])

        return {
            isOpen,
            tabs,
            selectedTab,
        }
    },

    components: { EventPriceChart, EventTVLChart },
})
</script>

<template>
    <div :class="$style.wrapper">
        <div @click="isOpen = !isOpen" :class="$style.header">
            <div :class="$style.title">Chart</div>

            <Icon name="arrow" size="20" :class="!isOpen && $style.rotate" />
        </div>

        <div v-show="isOpen" :class="$style.base">
            <!-- Price Chart -->
            <EventPriceChart v-if="selectedTab == 'Price'" :event="event" />

            <!-- TVL Chart -->
            <EventTVLChart v-else-if="selectedTab == 'TVL'" :event="event" />

            <!-- Liquidity Chart -->
        </div>

        <div v-show="isOpen" :class="$style.bottom">
            <!-- Tabs: Price, TVL, Liquidity -->
            <div :class="$style.tabs">
                <div
                    v-for="tab in tabs"
                    :key="tab"
                    @click="selectedTab = tab"
                    :class="[$style.tab, tab == selectedTab && $style.active]"
                >
                    {{ tab }}
                </div>
            </div>

            <!-- Chart Status: Pause / Real-time -->
            <div v-if="event.status == 'FINISHED'" :class="$style.pause">
                <Icon name="pause" size="16" />

                Chart is paused
            </div>
            <div v-else-if="event.status == 'STARTED'" :class="$style.pause">
                <Icon name="bolt" size="12" />

                Real-time chart
            </div>
        </div>
    </div>
</template>

<style module>
.wrapper {
    background: var(--card-bg);
    border-radius: 8px;
    border: 1px solid var(--border);
    padding: 4px;
    flex: 1;
}

.header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    cursor: pointer;
    padding: 12px 16px 12px 16px;
    border-radius: 6px;

    transition: background 0.15s ease;
}

.header:hover {
    background: var(--opacity-05);
}

.title {
    font-size: 14px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-primary);
}

.header svg {
    fill: var(--icon);
    transform: rotate(180deg);

    transition: transform 0.2s ease;
}

.header svg.rotate {
    transform: rotate(360deg);
}

.base {
    position: relative;

    margin: 16px 16px 24px 16px;
}

.bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 0 16px 16px 16px;
}

.pause {
    display: flex;
    align-items: center;
    gap: 6px;

    font-size: 12px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-tertiary);
}

.pause svg {
    fill: var(--text-secondary);
}

.tabs {
    display: flex;
    align-items: center;
    gap: 6px;
}

.tab {
    display: flex;
    align-items: center;

    font-size: 12px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-tertiary);

    height: 24px;
    cursor: pointer;
    border-radius: 4px;

    padding: 0 8px;

    transition: all 0.2s ease;
}

.tab:hover {
    color: var(--text-secondary);
}

.tab.active {
    color: var(--text-primary);
    background: var(--btn-secondary-bg);
}
</style>
