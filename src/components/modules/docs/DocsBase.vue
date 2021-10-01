<script>
import { defineComponent, onMounted, ref } from "vue"

import ArticleContent from "./ArticleContent"

/**
 * API
 */
import { fetchArticles, fetchSections } from "@/api/sanity"

export default defineComponent({
    name: "DocsBase",

    setup() {
        const sections = ref({})

        const selectedArticle = ref({})

        onMounted(async () => {
            const allSections = await fetchSections()
            const articles = await fetchArticles()

            /** Sections */
            allSections
                .sort((a, b) => a.position - b.position)
                .forEach(section => {
                    if (!sections.value[section.title]) {
                        sections.value[section.title] = []
                    }
                })

            /** Sort articles */
            articles
                .sort((a, b) => a.position - b.position)
                .forEach(article => {
                    if (sections.value[article.section.title]) {
                        sections.value[article.section.title].push(article)
                    }
                })

            /** pre-selected article */
            selectedArticle.value = sections.value[allSections[0].title][0]
        })

        const selectArticle = article => {
            selectedArticle.value = article
        }

        return { sections, selectArticle, selectedArticle }
    },

    components: { ArticleContent },
})
</script>

<template>
    <div :class="$style.wrapper">
        <div :class="$style.nav">
            <div
                v-for="(section, index) in sections"
                :key="section"
                :class="$style.section"
            >
                <div :class="$style.title">{{ index }}</div>

                <div
                    v-for="article in section"
                    :key="article._id"
                    @click="selectArticle(article)"
                    :class="[
                        $style.link,
                        selectedArticle == article && $style.active,
                    ]"
                >
                    {{ article.title }}
                </div>
            </div>
        </div>

        <div :class="$style.base">
            <ArticleContent
                v-if="selectedArticle.Body"
                :source="selectedArticle.Body"
            />
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

.section {
    margin-bottom: 48px;
}

.title {
    font-size: 12px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-tertiary);
    text-transform: uppercase;

    margin-bottom: 8px;
}

.link {
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

.link:hover {
    background: var(--opacity-05);
}

.link.active {
    color: var(--text-primary);
    background: var(--opacity-10);

    border-right: 3px solid var(--blue);
}

.base {
    flex: 1;

    margin: 50px 0 0 80px;
}
</style>
