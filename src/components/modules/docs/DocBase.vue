<script>
import { defineComponent, computed } from "vue"

import ArticleContent from "./ArticleContent"

/**
 * Store
 */
import { useDocsStore } from "@/store/docs"

export default defineComponent({
    name: "DocBase",

    setup() {
        const docsStore = useDocsStore()

        const nextArticle = computed(() => {
            if (!docsStore.article.section) return

            const currentSection = docsStore.article.section.title
            const selectedArticleIndex = docsStore.sections[
                currentSection
            ].indexOf(docsStore.article)

            if (docsStore.sections[currentSection][selectedArticleIndex + 1]) {
                return docsStore.sections[currentSection][
                    selectedArticleIndex + 1
                ]
            } else {
                const allSections = Object.keys(docsStore.sections)
                const currentSectionIndex = allSections.indexOf(currentSection)

                return (
                    docsStore.sections[allSections[currentSectionIndex + 1]] &&
                    docsStore.sections[allSections[currentSectionIndex + 1]][0]
                )
            }
        })

        const handleNextPage = () => {
            docsStore.article = nextArticle.value

            document.getElementById("app").scrollTo({
                top: 0,
                behavior: "smooth",
            })
        }

        return {
            docsStore,
            nextArticle,
            handleNextPage,
        }
    },

    components: { ArticleContent },
})
</script>

<template>
    <div :class="$style.wrapper">
        <ArticleContent
            v-if="docsStore.article.Body"
            :source="docsStore.article.Body"
        />

        <div
            v-if="nextArticle"
            @click="handleNextPage"
            :class="$style.next_btn"
        >
            <div :class="$style.next_txt">
                <span>Next Page</span>
                <span>{{ nextArticle.title }}</span>
            </div>

            <Icon name="arrowright" size="16" />
        </div>
    </div>
</template>

<style module>
.wrapper {
}

.next_btn {
    display: flex;
    align-items: center;
    justify-content: space-between;

    cursor: pointer;
    max-width: 600px;
    border-radius: 6px;
    border: 1px solid var(--border);
    height: 68px;

    padding: 0 16px;
    margin-bottom: 150px;

    transition: border 0.2s ease;
}

.next_btn:hover {
    border: 1px solid var(--border-highlight);
}

.next_txt {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.next_btn span:first-child {
    font-size: 13px;
    line-height: 1.1;
    font-weight: 600;
    color: var(--text-tertiary);
}

.next_btn span:last-child {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
}

.next_btn svg {
    fill: var(--icon);
}
</style>
