<script>
import { defineComponent, ref, toRefs, computed } from "vue"
import { DateTime } from "luxon"
import Markdown from "markdown-it"

/**
 * UI
 */
import Button from "@/components/ui/Button"

/**
 * Services
 */
import { toClipboard } from "@/services/utils/global"

/**
 * Store
 */
import { useNotificationsStore } from "@/store/notifications"

export default defineComponent({
    name: "ReleaseCard",
    props: { release: Object },

    setup(props) {
        const { release } = toRefs(props)

        const notificationsStore = useNotificationsStore()

        const md = ref(null)
        md.value = new Markdown({ html: true })

        const firstParagraphRegex = /\<p>(.*?)\<\/p>/
        const content = computed(
            () =>
                firstParagraphRegex.exec(
                    md.value.render(release.value.Body),
                )[0],
        )

        const copyURL = () => {
            toClipboard(
                `https://app.juster.fi/releases/${release.value.slug.current}`,
            )

            notificationsStore.create({
                notification: {
                    type: "success",
                    title: "Release URL copied to clipboard",
                    description: "Use Ctrl+V to paste",
                    autoDestroy: true,
                },
            })
        }

        const openGithub = () => {
            window
                .open("https://github.com/juster-finance/juster-app", "_blank")
                .focus()
        }

        return { content, DateTime, copyURL, openGithub }
    },

    components: { Button },
})
</script>

<template>
    <router-link
        :to="`/releases/${release.slug.current}`"
        :class="$style.wrapper"
    >
        <div :class="$style.when">
            {{ DateTime.fromISO(release._updatedAt).toRelative() }}
        </div>

        <div>
            <div :class="$style.card">
                <h2 :class="$style.title">{{ release.title }}</h2>

                <div :class="$style.badges">
                    <div :class="$style.badge">By <span>Juster</span></div>

                    <div :class="$style.dot" />

                    <div :class="$style.badge"><span>Minor</span> Update</div>
                </div>

                <div v-html="content" :class="$style.body_preview"></div>

                <div :class="$style.buttons">
                    <router-link :to="`/releases/${release.slug.current}`">
                        <Button type="secondary" size="small">
                            <Icon name="document" size="16" />View all changes
                        </Button>
                    </router-link>

                    <Button
                        @click.prevent="openGithub"
                        type="secondary"
                        size="small"
                    >
                        <Icon name="github" size="16" /> View on Github
                    </Button>

                    <Button
                        @click.prevent="copyURL"
                        type="tertiary"
                        size="small"
                    >
                        <Icon name="back" size="16" /> Share
                    </Button>
                </div>
            </div>
        </div>
    </router-link>
</template>

<style module>
.wrapper {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.when {
    font-size: 11px;
    line-height: 1.1;
    font-weight: 700;
    color: var(--text-tertiary);

    text-transform: uppercase;
}

.card {
    width: 700px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--card-bg);
    padding: 32px;
    box-shadow: 0px 1px 10px rgba(0, 0, 0, 0.3);

    transition: box-shadow 0.2s ease;
}

.card:hover {
    box-shadow: 0 0 0 rgba(0, 0, 0, 0);
}

.title {
    font-size: 24px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-primary);

    margin-bottom: 16px;
}

.badges {
    display: flex;
    align-items: center;
    gap: 12px;

    margin-bottom: 16px;
}

.badge {
    font-size: 12px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-tertiary);
}

.badge span {
    color: var(--text-secondary);
}

.dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--text-tertiary);
}

.body_preview {
    font-size: 14px;
    line-height: 1.6;
    font-weight: 400;
    color: var(--text-tertiary);

    margin-bottom: 24px;
}

.buttons {
    display: flex;
    align-items: center;
    gap: 8px;
}
</style>
