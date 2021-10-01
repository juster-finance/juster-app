<script>
import { defineComponent, onMounted, ref, computed } from "vue"

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

        const nextArticle = computed(() => {
            if (!selectedArticle.value.section) return

            const currentSection = selectedArticle.value.section.title
            const selectedArticleIndex = sections.value[currentSection].indexOf(
                selectedArticle.value,
            )

            if (sections.value[currentSection][selectedArticleIndex + 1]) {
                return sections.value[currentSection][selectedArticleIndex + 1]
            } else {
                const allSections = Object.keys(sections.value)
                const currentSectionIndex = allSections.indexOf(currentSection)

                return (
                    sections.value[allSections[currentSectionIndex + 1]] &&
                    sections.value[allSections[currentSectionIndex + 1]][0]
                )
            }
        })

        const selectArticle = article => {
            selectedArticle.value = article
        }

        const handleNextPage = () => {
            selectedArticle.value = nextArticle.value

            document.getElementById("app").scrollTo({
                top: 0,
                behavior: "smooth",
            })
        }

        return {
            sections,
            selectArticle,
            handleNextPage,
            selectedArticle,
            nextArticle,
        }
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
