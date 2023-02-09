<script setup>
/**
 * Vendor
 */
import { onMounted, ref, reactive } from "vue"
import { useRoute, useRouter } from "vue-router"

/**
 * API
 */
import { fetchArticles, fetchSections } from "@/api/sanity"

/**
 * UI
 */
import {
	Dropdown,
	DropdownItem,
	DropdownDivider,
	DropdownTitle,
} from "@ui/Dropdown"

/**
 * Store
 */
import { useDocsStore } from "@store/docs"

const route = useRoute()

const docsStore = useDocsStore()

const generalLinks = ref([])

const positions = reactive([
	{
		section: "General",
		links: ["Discover", "Staking", "Liquidity", "Withdraw", "Roadmap"],
	},
	{
		section: "Getting Started",
		links: ["Introduction", "Wallets"],
	},
	{
		section: "Essentials",
		links: [],
	},
	{
		section: "Extra Topics",
		links: ["Glossary", "FAQ"],
	},
])

onMounted(async () => {
	if (Object.keys(docsStore.sections).length) return

	const allSections = await fetchSections()
	const articles = await fetchArticles()

	/** Sections */
	allSections
		.sort((a, b) => {
			const aSectionIdx = positions.findIndex(
				(p) => p.section === a.title,
			)
			const bSectionIdx = positions.findIndex(
				(p) => p.section === b.title,
			)
			return aSectionIdx - bSectionIdx
		})
		.forEach((section) => {
			if (!docsStore.sections[section.title]) {
				docsStore.sections[section.title] = []
			}
		})

	generalLinks.value = articles
		.filter((a) => !a.section)
		.sort((a, b) => {
			const section = positions.find((p) => p.section === "General")
			const aArticleIdx = section.links.findIndex((l) => l === a.title)
			const bArticleIdx = section.links.findIndex((l) => l === b.title)
			return aArticleIdx - bArticleIdx
		})

	/** Sort articles */
	articles
		.filter((a) => a.section)
		.sort((a, b) => {
			const aSection = positions.find(
				(p) => p.section === a.section.title,
			)
			const bSection = positions.find(
				(p) => p.section === b.section.title,
			)
			const aArticleIdx = aSection.links.findIndex((l) => l === a.title)
			const bArticleIdx = bSection.links.findIndex((l) => l === b.title)
			return aArticleIdx - bArticleIdx
		})
		.forEach((article) => {
			if (docsStore.sections[article.section.title]) {
				docsStore.sections[article.section.title].push(article)
			}
		})

	/** Select current */
	if (route.params.slug) {
		let articleBySlug
		articles.forEach((article) => {
			if (article.slug.current == route.params.slug)
				articleBySlug = article
		})
		selectArticle(articleBySlug)
	}
})

const selectArticle = (article) => {
	docsStore.article = article
}
</script>

<template>
	<div :class="$style.wrapper">
		<div :class="$style.nav">
			<div :class="$style.general_links">
				<router-link
					v-for="(generalLink, gIndex) in generalLinks"
					:key="gIndex"
					@click="selectArticle(generalLink)"
					:to="`/docs/${generalLink.slug.current}`"
					:class="[
						$style.general_link,
						docsStore.article.slug.current ===
							generalLink.slug.current && $style.active,
					]"
				>
					<div :class="$style.icon">
						<Icon :name="generalLink.icon" size="16" />
					</div>

					{{ generalLink.title }}
				</router-link>
			</div>

			<div
				v-for="(section, index) in docsStore.sections"
				:key="section"
				:class="$style.section"
			>
				<div :class="$style.title">{{ index }}</div>

				<router-link
					v-for="article in section"
					:key="article._id"
					:to="article.slug.current"
					@click="selectArticle(article)"
					:class="[
						$style.link,
						docsStore.article == article && $style.active,
					]"
				>
					{{ article.title }}
				</router-link>
			</div>
		</div>

		<div :class="$style.base">
			<Dropdown>
				<template #trigger>
					<Flex align="center" gap="8" wide :class="$style.menu_btn">
						<Icon name="menu" size="16" color="secondary" />
						<Text size="14" weight="600" color="primary">Menu</Text>
					</Flex>
				</template>

				<template #dropdown>
					<router-link
						v-for="link in generalLinks"
						@click="selectArticle(link)"
						:to="`/docs/${link.slug.current}`"
					>
						<DropdownItem>
							<Icon
								:name="link.icon"
								size="16"
								color="secondary"
							/>
							{{ link.title }}
						</DropdownItem>
					</router-link>
					<DropdownDivider />

					<template
						v-for="(section, sectionName) in docsStore.sections"
					>
						<DropdownTitle>{{ sectionName }}</DropdownTitle>
						<router-link
							v-for="link in section"
							@click="selectArticle(link)"
							:to="`/docs/${link.slug.current}`"
						>
							<DropdownItem>
								{{ link.title }}
							</DropdownItem>
						</router-link>
						<DropdownDivider />
					</template>
				</template>
			</Dropdown>

			<router-view />
		</div>
	</div>
</template>

<style module>
.wrapper {
	display: flex;
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

.general_link:focus {
	color: var(--text-secondary);
	box-shadow: none;
}

.general_link:hover {
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
}

.link:focus-visible {
	color: var(--text-secondary);
}

.link.active {
	color: var(--text-blue);
}

.base {
	flex: 1;

	margin: 50px 0 0 80px;
}

.menu_btn {
	display: none;

	cursor: pointer;
	background: var(--btn-secondary-bg);
	padding: 8px;
	border-radius: 6px;
	border: 1px solid var(--border);

	margin-bottom: 32px;
}

@media (max-width: 1100px) {
	.base {
		margin: 50px 0 0 0;
	}
}

@media (max-width: 850px) {
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
		display: flex;
	}

	.nav {
		display: none;
	}
}
</style>
