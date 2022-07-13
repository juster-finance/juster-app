<script setup>
import { onMounted, ref, reactive } from "vue"
import { useRouter, useRoute } from "vue-router"
import Markdown from "markdown-it"

/**
 * API
 */
import { fetchArticles, fetchSections } from "@/api/sanity"

/**
 * Store
 */
import { useDocsStore } from "@/store/docs"

const router = useRouter()
const route = useRoute()

const docsStore = useDocsStore()

const expandMenu = ref(false)

const anchors = ref([])

const generalLinks = reactive([
	{
		name: "Discover",
		icon: "compass",
		url: "/discover",
	},
	{
		name: "Betting",
		icon: "arrows",
		url: "/betting",
	},
	{
		name: "Liquidity",
		icon: "liquidity",
		url: "/liquidity",
	},
	{
		name: "Withdraw",
		icon: "money",
		url: "/withdraw",
	},
	{
		name: "Roadmap",
		icon: "map",
		url: "/roadmap",
	},
])

onMounted(async () => {
	if (Object.keys(docsStore.sections).length) return

	const allSections = await fetchSections()
	const articles = await fetchArticles()

	if (docsStore.article.title) {
		let articleBySlug

		Object.keys(docsStore.sections).forEach((section) => {
			docsStore.sections[section].forEach((article) => {
				if (article.slug.current == route.params.slug) {
					articleBySlug = article
				}
			})
		})

		selectArticle(articleBySlug)
	} else {
		/** Sections */
		allSections
			.sort((a, b) => a.position - b.position)
			.forEach((section) => {
				if (!docsStore.sections[section.title]) {
					docsStore.sections[section.title] = []
				}
			})

		/** Sort articles */
		articles
			.sort((a, b) => a.position - b.position)
			.forEach((article) => {
				if (docsStore.sections[article.section.title]) {
					docsStore.sections[article.section.title].push(article)
				}
			})

		/** pre-selected article */
		// if (route.params.slug) {

		// 	let articleBySlug

		// 	Object.keys(docsStore.sections).forEach((section) => {
		// 		docsStore.sections[section].forEach((article) => {
		// 			if (article.slug.current == route.params.slug) {
		// 				articleBySlug = article
		// 			}
		// 		})
		// 	})

		// 	selectArticle(articleBySlug)
		// } else {
		// 	selectArticle(docsStore.sections[allSections[0].title][0])
		// }
	}
})

const selectArticle = (article) => {
	docsStore.article = article

	router.push(`/docs/${article.slug.current}`)

	/** find content */
	const md = new Markdown()
	const body = md.render(article.Body)
	const regex = /(<h2>.+)/g
	const content = body.match(regex)

	anchors.value =
		content &&
		content.map((anchor) =>
			anchor.replaceAll("<h2>", "").replaceAll("</h2>", ""),
		)
}
</script>

<template>
	<div :class="$style.wrapper">
		<div :class="[$style.nav, expandMenu && $style.expanded]">
			<div :class="$style.general_links">
				<router-link
					v-for="(generalLink, gIndex) in generalLinks"
					:key="gIndex"
					:to="`/docs${generalLink.url}`"
					:class="[
						$style.general_link,
						route.name === generalLink.name && $style.active,
					]"
				>
					<div :class="$style.icon">
						<Icon :name="generalLink.icon" size="16" />
					</div>

					{{ generalLink.name }}
				</router-link>
			</div>

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

		<!-- <div v-if="anchors" :class="$style.anchors">
			<span :class="$style.anchors_title">Content</span>
			<div
				v-for="(anchor, index) in anchors"
				:key="index"
				:class="$style.anchor"
			>
				{{ anchor }}
			</div>
		</div> -->

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
	display: flex;
	flex-direction: column;
	gap: 40px;

	width: 200px;
	min-height: 100vh;

	padding-top: 50px;
	background: var(--app-bg);
}

.general_links {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.general_link {
	display: flex;
	align-items: center;
	gap: 12px;

	font-size: 14px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-tertiary);

	transition: all 0.2s ease;
}

.general_link:hover {
	color: var(--text-secondary);
}

.general_link:hover .icon {
	fill: var(--text-secondary);
}

.general_link.active {
	color: var(--text-primary);
}

.general_link.active .icon {
	background: var(--brand);
	fill: var(--text-black);
}

.general_link .icon {
	display: flex;
	align-items: center;
	justify-content: center;

	width: 24px;
	height: 24px;
	border-radius: 5px;
	background: rgba(255, 255, 255, 0.05);
	box-shadow: inset 0px 1px 2px rgba(255, 255, 255, 0.15);
	fill: var(--text-tertiary);

	transition: all 0.2s ease;
}

.section {
}

.title {
	font-size: 14px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-primary);

	margin-bottom: 8px;
}

.link {
	display: flex;
	align-items: center;

	font-size: 14px;
	line-height: 1;
	font-weight: 500;
	color: var(--text-tertiary);

	cursor: pointer;
	padding: 0 10px;
	margin-left: -10px;
	height: 34px;
	border-radius: 5px;

	transition: all 0.2s ease;
}

.link:hover {
	color: var(--text-secondary);
	background: var(--opacity-05);
}

.link.active {
	color: var(--text-primary);

	border-right: 3px solid var(--blue);
}

.base {
	flex: 1;

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
