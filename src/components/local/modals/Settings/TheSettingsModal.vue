<script>
import { defineComponent, reactive, ref, toRefs, watch } from "vue"

/**
 * UI
 */
import Modal from "@/components/ui/Modal"
import Button from "@/components/ui/Button"

import WithdrawalsTab from "./WithdrawalsTab"

export default defineComponent({
    name: "TheSettingsModal",
    props: { show: Boolean },

    setup(props) {
        const { show } = toRefs(props)

        const pages = reactive([
            {
                name: "General",
                icon: "Settings",
            },
            {
                name: "Amounts",
                icon: "Money",
            },
            {
                name: "Appearance",
                icon: "Spark",
            },
            {
                name: "Security",
                icon: "Lock",
            },
            {
                name: "Withdrawals",
                icon: "Cup",
            },
        ])
        const currentPage = ref("General")

        watch(show, () => {
            if (!show.value) currentPage.value = "General"
        })

        return { pages, currentPage }
    },

    components: {
        Modal,
        Button,
        WithdrawalsTab,
    },
})
</script>

<template>
    <Modal
        :show="show"
        width="550"
        padding="20px 0 20px 0"
        closable
        @onClose="$emit('onClose')"
    >
        <div :class="$style.title">Settings</div>

        <div :class="$style.divider" />

        <div :class="$style.base">
            <div :class="$style.nav">
                <div :class="$style.links">
                    <div
                        v-for="page in pages"
                        :key="page.name"
                        @click="currentPage = page.name"
                        :class="[
                            $style.link,
                            currentPage == page.name && $style.current,
                        ]"
                    >
                        <Icon :name="page.icon" size="16" /> {{ page.name }}
                    </div>
                </div>

                <div :class="$style.hint">
                    <span>Juster</span>, version 0.1.0
                </div>
            </div>

            <div v-if="currentPage == 'General'" :class="$style.tab">
                General
            </div>

            <WithdrawalsTab
                v-if="currentPage == 'Withdrawals'"
                :class="$style.tab"
            />
        </div>
    </Modal>
</template>

<style module>
.wrapper {
}

.title {
    font-size: 14px;
    font-weight: 600;
    line-height: 1;
    color: var(--text-primary);

    margin-bottom: 20px;
    padding: 0 20px;
}

.divider {
    width: 100%;
    height: 1px;
    background: var(--border);
}

.base {
    display: flex;

    border-bottom: 1px solid var(--border);
}

.nav {
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    width: 160px;
    height: 330px;
    background: var(--settings-nav-bg);

    padding: 16px 0 16px 20px;
}

.hint {
    font-size: 10px;
    font-weight: 500;
    line-height: 1.4;
    color: var(--text-tertiary);
}

.hint span {
    color: var(--text-secondary);
}

.links {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.link {
    display: flex;
    align-items: center;
    gap: 10px;

    font-size: 13px;
    line-height: 1.4;
    font-weight: 500;
    color: var(--text-secondary);

    cursor: pointer;

    transition: all 0.2s ease;
}

.link:hover {
    color: var(--text-primary);
}

.link.current {
    color: var(--text-primary);
}

.link.current svg {
    fill: var(--blue);
}

.link svg {
    padding: 4px;
    border-radius: 8px;
    background: var(--opacity-10);
    box-sizing: content-box;
    fill: var(--opacity-80);

    transition: fill 0.2s ease;
}

.tab {
    flex: 1;
    height: 330px;
    overflow: auto;
}
</style>
