<script>
export default {
    name: "EventDetailsCard",
    props: { event: Object, participants: Number, highestRatio: String },
}
</script>

<template>
    <div :class="$style.wrapper">
        <div :class="$style.title">Details <Icon name="help" size="14" /></div>

        <div :class="$style.params">
            <div :class="$style.param">
                <span>ID</span>
                <span><Icon name="hash" size="12" />{{ event.id }}</span>
            </div>
            <div :class="$style.param">
                <span>Participants</span>
                <span><Icon name="users" size="12" />{{ participants }}</span>
            </div>
            <div :class="$style.param">
                <span>Highest ratio</span>
                <span><Icon name="close" size="12" />{{ highestRatio }}</span>
            </div>
        </div>

        <div :class="$style.params">
            <div :class="$style.subtitle">LIQUIDITY</div>
            <div :class="$style.param">
                <span>Total provided</span>
                <span
                    ><Icon name="liquidity" size="12" />{{
                        event.totalLiquidityProvided
                    }}</span
                >
            </div>
            <div :class="$style.param">
                <span>Liquidity percent</span>
                <span>{{ event.liquidityPercent * 100 }}%</span>
            </div>
        </div>
    </div>
</template>

<style module>
.wrapper {
    border-radius: 8px;
    border: 1px solid var(--border);
    padding: 20px;
    background: var(--card-bg);
}

.title {
    display: flex;
    align-items: center;
    gap: 6px;

    font-size: 14px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-primary);
    fill: var(--opacity-40);

    margin-bottom: 20px;
}

.subtitle {
    font-size: 12px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-secondary);
}

.params {
    display: flex;
    flex-direction: column;
    gap: 20px;

    margin-bottom: 32px;
}

.params:last-child {
    margin-bottom: 0;
}

.param {
    display: flex;
    justify-content: space-between;
}

.param span:nth-child(1) {
    font-size: 14px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-tertiary);
}

.param span:nth-child(2) {
    display: flex;
    align-items: center;
    gap: 6px;

    font-size: 14px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-primary);
    fill: var(--opacity-40);
}
</style>
