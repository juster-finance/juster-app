<script>
import { defineComponent, onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import Markdown from "markdown-it"

/**
 * API
 */
import { fetchArticles, fetchSections } from "@/api/sanity"

/**
 * Store
 */
import { useDocsStore } from "@/store/docs"

export default defineComponent({
    name: "DocsBase",

    setup() {
        const router = useRouter()

        const docsStore = useDocsStore()

        const expandMenu = ref(false)

        const anchors = ref([])

        onMounted(async () => {
            const allSections = await fetchSections()
            const articles = await fetchArticles()

            /** Sections */
            allSections
                .sort((a, b) => a.position - b.position)
                .forEach(section => {
                    if (!docsStore.sections[section.title]) {
                        docsStore.sections[section.title] = []
                    }
                })

            /** Sort articles */
            articles
                .sort((a, b) => a.position - b.position)
                .forEach(article => {
                    if (docsStore.sections[article.section.title]) {
                        docsStore.sections[article.section.title].push(article)
                    }
                })

            /** pre-selected article */
            selectArticle(docsStore.sections[allSections[0].title][0])
        })

        const selectArticle = article => {
            docsStore.article = article

            router.push(`/docs/${article.slug.current}`)

            /** find content */
            const md = new Markdown()
            const body = md.render(article.Body)
            const regex = /(<h2>.+)/g
            const content = body.match(regex)

            anchors.value =
                content &&
                content.map(anchor =>
                    anchor.replaceAll("<h2>", "").replaceAll("</h2>", ""),
                )
        }

        return {
            docsStore,
            selectArticle,
            anchors,
            expandMenu,
        }
    },
})
</script>

<template>
    <div :class="$style.wrapper">
        <div :class="[$style.nav, expandMenu && $style.expanded]">
            <div
                v-for="(section, index) in docsStore.sections"
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
                        docsStore.article == article && $style.active,
                    ]"
                >
                    {{ article.title }}
                </div>
            </div>
        </div>

        <div :class="$style.base">
            <router-view />
        </div>

        <div v-if="anchors" :class="$style.anchors">
            <span :class="$style.anchors_title">Content</span>
            <div
                v-for="(anchor, index) in anchors"
                :key="index"
                :class="$style.anchor"
            >
                {{ anchor }}
            </div>
        </div>

        <Icon
            @click="expandMenu = !expandMenu"
            :name="expandMenu ? 'close' : 'menu'"
            size="20"
            :class="$style.menu_btn"
        />
    </div>
</template>

<style module>
.wrapper {
    display: flex;
    position: relative;
}

.nav {
    width: 200px;
    padding-top: 50px;
    border-right: 1px solid var(--border);
    background: var(--app-background);
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
    max-width: 600px;

    margin: 50px 0 0 80px;
}

.anchors {
    height: fit-content;
    position: sticky;
    top: 130px;
    display: flex;
    flex-direction: column;
    gap: 20px;

    margin: 0 0 0 100px;
}

.anchors span {
    font-size: 14px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-tertiary);
}

.anchor {
    font-size: 14px;
    line-height: 1;
    font-weight: 500;
    color: var(--text-secondary);

    transition: color 0.2s ease;
}

.anchor:hover {
    color: var(--text-primary);
}

.menu_btn {
    display: none;
    position: absolute;
    top: 32px;
    left: 0;
    cursor: pointer;
    background: var(--btn-secondary-bg);
    box-sizing: content-box;
    padding: 4px;
    border-radius: 6px;
    border: 1px solid var(--border);

    fill: var(--icon);
}

@media (max-width: 850px) {
    .base {
        margin: 32px 0 0 32px;
    }

    .anchors {
        margin-left: 40px;
    }
}

@media (max-width: 700px) {
    .anchors {
        display: none;
    }
}

@media (max-width: 600px) {
    .menu_btn {
        display: initial;
    }

    .nav {
        position: absolute;
        left: -250px;
        top: 0;
        bottom: 0;

        padding-top: 100px;

        transition: left 0.15s ease;
    }

    .nav.expanded {
        left: 0;
    }

    .base {
        margin-left: 0;
        margin-top: 80px;
    }
}
</style>
