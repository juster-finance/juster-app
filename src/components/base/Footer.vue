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
                        <div :class="$style.name">General</div>

                        <router-link to="/observe" :class="$style.link"
                            >Observe</router-link
                        >
                        <router-link to="/symbols" :class="$style.link"
                            >Symbols</router-link
                        >
                        <router-link to="/rating" :class="$style.link"
                            >Rating</router-link
                        >
                    </div>
                    <div :class="$style.column">
                        <div :class="$style.name">Socials</div>

                        <div :class="$style.link">Discord</div>
                        <div :class="$style.link">Twitter</div>
                        <div :class="$style.link">Facebook</div>
                        <div :class="$style.link">Telegram</div>
                    </div>
                    <div :class="$style.column">
                        <div :class="$style.name">Other</div>

                        <div :class="$style.link">Contact us</div>
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
    height: 300px;

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
}

.column {
    display: flex;
    flex-direction: column;
    gap: 12px;

    margin-right: 150px;
}

.name {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
}

.link {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-secondary);

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
</style>
