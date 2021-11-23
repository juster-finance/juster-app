<script>
import { defineComponent } from "vue"

export default defineComponent({
    name: "Footer",
})
</script>

<template>
    <div :class="$style.wrapper">
        <div :class="$style.base">
            <div :class="$style.content">
                <img src="@/assets/logo.png" />

                <div :class="$style.columns">
                    <div :class="$style.column">
                        <div :class="$style.name">Juster</div>

                        <router-link to="/explore" :class="$style.link"
                            >Explore</router-link
                        >
                        <router-link to="/events" :class="$style.link"
                            >Events</router-link
                        >
                        <router-link to="/symbols" :class="$style.link"
                            >Symbols</router-link
                        >
                        <!-- <router-link to="/rating" :class="$style.link"
                            >Rating</router-link
                        > -->
                    </div>
                    <div :class="$style.column">
                        <div :class="$style.name">Follow us</div>
                        <a
                            href="https://discord.gg/RfbYR2Zj"
                            target="_blank"
                            rel="nofolow noreferrer"
                            :class="$style.link"
                            >Discord</a
                        ><a
                            href="https://t.me/baking_bad_chat"
                            target="_blank"
                            rel="nofolow noreferrer"
                            :class="$style.link"
                            >GitHub</a
                        >
                        <a
                            href="https://twitter.com/TezosBakingBad"
                            target="_blank"
                            rel="nofolow noreferrer"
                            :class="$style.link"
                            >Twitter</a
                        >
                    </div>
                    <div :class="$style.column">
                        <div :class="$style.name">Learn</div>
                        <router-link to="/docs" :class="$style.link"
                            >Documentation</router-link
                        >
                        <router-link to="/terms" :class="$style.link"
                            >Terms of Use</router-link
                        >
                        <router-link to="/policy" :class="$style.link"
                            >Privacy Policy</router-link
                        >
                    </div>
                </div>
            </div>

            <div :class="$style.right">© 2021 Juster. All rights reserved</div>
        </div>
    </div>
</template>

<style module>
.wrapper {
    width: 100%;

    display: flex;
    justify-content: center;

    background: rgba(0, 0, 0, 0.25);
}

.base {
    width: 100%;
    max-width: 1250px;
    margin: 0 32px;
    padding: 50px 0;
}

.content {
    display: flex;
    justify-content: space-between;
    gap: 60px;
}

.content img {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: #fff;
    padding: 4px;
}

.columns {
    display: flex;
    flex-wrap: wrap;
    gap: 150px;

    margin-right: 150px;
}

.column {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.name {
    font-family: "CalSans";

    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
}

.link {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-tertiary);

    transition: color 0.2s ease;
}

.link:hover {
    color: var(--text-primary);
}

.right {
    font-size: 13px;
    color: var(--text-tertiary);

    margin-top: 40px;
}

@media (max-width: 850px) {
    .columns {
        margin-right: 100px;
        gap: 100px;
    }
}

@media (max-width: 680px) {
    .columns {
        gap: 50px;
        margin-right: 40px;
    }
}
</style>
