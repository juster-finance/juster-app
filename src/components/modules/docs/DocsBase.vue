<script>
export default {
    name: "DocsBase",
}
</script>

<template>
    <div :class="$style.wrapper">
        <div :class="$style.nav">
            <div :class="$style.nav_block">
                <div :class="$style.nav_title">General</div>

                <div :class="$style.nav_link">Introduction</div>
                <div :class="$style.nav_link">Getting Started</div>
                <div :class="$style.nav_link">Roadmap</div>
            </div>
            <div :class="$style.nav_block">
                <div :class="$style.nav_title">Betting</div>

                <div :class="$style.nav_link">Markets</div>
                <div :class="$style.nav_link">Betting</div>
                <div :class="$style.nav_link">Symbols</div>
                <div :class="$style.nav_link">Event Page</div>
            </div>
            <div :class="$style.nav_block">
                <div :class="$style.nav_title">Liquidity</div>

                <div :class="$style.nav_link">Adding Liquidity</div>
                <div :class="$style.nav_link">Earn fees</div>
            </div>
            <div :class="$style.nav_block">
                <div :class="$style.nav_title">Profile</div>

                <div :class="$style.nav_link">Statistics</div>
                <div :class="$style.nav_link">My submissions</div>
            </div>
        </div>

        <div :class="$style.base">
            Work In Progress
        </div>
    </div>
</template>

<style module>
.wrapper {
    display: flex;
}

.nav {
    width: 200px;
    padding-top: 50px;
    border-right: 1px solid var(--border);
}

.nav_block {
    margin-bottom: 48px;
}

.nav_title {
    font-size: 14px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-tertiary);

    margin-bottom: 14px;
}

.nav_link {
    display: flex;
    align-items: center;

    font-size: 14px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-secondary);

    padding: 0 10px;
    margin-left: -10px;
    height: 34px;
    border-radius: 5px 0 0 5px;

    transition: all 0.2s ease;
}

.nav_link:hover {
    background: var(--opacity-05);
}

.nav_link.active {
    color: var(--text-primary);
}

.base {
    flex: 1;

    margin: 50px 0 0 80px;
}
</style>
