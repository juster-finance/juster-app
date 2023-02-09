<script setup>
/**
 * Vendor
 */
import { onMounted, ref, watch, computed } from "vue"
import { DateTime } from "luxon"

/**
 * Modules
 */
import ArticleContent from "./ArticleContent.vue"
import TableOfContents from "./TableOfContents.vue"

/**
 * Store
 */
import { useDocsStore } from "@store/docs"

const docsStore = useDocsStore()

const links = ref([])

onMounted(() => {
	if (!docsStore.article.content) return
	links.value = docsStore.article.content
		.filter((block) => block.style?.startsWith("h"))
		.map((block) => block.children[0].text)
})

const nextArticle = computed(() => {
	if (!docsStore.article.section) return

	const currentSection = docsStore.article.section.title
	const selectedArticleIndex = docsStore.sections[currentSection].indexOf(
		docsStore.article,
	)

	if (docsStore.sections[currentSection][selectedArticleIndex + 1]) {
		return docsStore.sections[currentSection][selectedArticleIndex + 1]
	} else {
		const allSections = Object.keys(docsStore.sections)
		const currentSectionIndex = allSections.indexOf(currentSection)

		return (
			docsStore.sections[allSections[currentSectionIndex + 1]] &&
			docsStore.sections[allSections[currentSectionIndex + 1]][0]
		)
	}
})

const prevArticle = computed(() => {
	if (!docsStore.article.section) return

	const currentSection = docsStore.article.section.title
	const selectedArticleIndex = docsStore.sections[currentSection].indexOf(
		docsStore.article,
	)

	if (docsStore.sections[currentSection][selectedArticleIndex - 1]) {
		return docsStore.sections[currentSection][selectedArticleIndex - 1]
	} else {
		const allSections = Object.keys(docsStore.sections)
		const currentSectionIndex = allSections.indexOf(currentSection)

		return (
			docsStore.sections[allSections[currentSectionIndex - 1]] &&
			docsStore.sections[allSections[currentSectionIndex - 1]][0]
		)
	}
})

watch(
	() => docsStore.article,
	() => {
		links.value = docsStore.article.content
			.filter((block) => block.style?.startsWith("h"))
			.map((block) => block.children[0].text)
	},
)

const handleNextPage = () => {
	docsStore.article = nextArticle.value

	document.getElementById("app").scrollTo({
		top: 0,
		behavior: "smooth",
	})
}

const handlePrevPage = () => {
	docsStore.article = prevArticle.value

	document.getElementById("app").scrollTo({
		top: 0,
		behavior: "smooth",
	})
}
</script>

<template>
	<Flex :class="$style.wrapper">
		<Flex direction="column" :class="$style.content">
			<ArticleContent
				v-if="docsStore.article.content"
				:title="docsStore.article.title"
				:content="docsStore.article.content"
			/>

			<Text
				v-if="docsStore.article._updatedAt"
				size="13"
				weight="500"
				color="tertiary"
				align="right"
			>
				Last updated
				{{
					DateTime.fromISO(docsStore.article._updatedAt)
						.setLocale("en")
						.toFormat("FF")
				}}
			</Text>

			<Flex align="center" gap="32" :class="$style.nav">
				<Flex
					v-if="prevArticle"
					@click="handlePrevPage"
					align="center"
					justify="between"
					wide
					:class="$style.next_btn"
				>
					<Flex direction="column" gap="8">
						<Text size="12" color="tertiary" weight="500">
							Previous Page
						</Text>
						<Text size="14" color="primary" weight="500">{{
							prevArticle.title
						}}</Text>
					</Flex>

					<Icon name="arrowleft" size="16" color="tertiary" />
				</Flex>
				<Flex
					v-if="nextArticle"
					@click="handleNextPage"
					align="center"
					justify="between"
					wide
					:class="$style.next_btn"
				>
					<Icon name="arrowright" size="16" color="tertiary" />

					<Flex align="end" direction="column" gap="8">
						<Text size="12" color="tertiary" weight="500">
							Next Page
						</Text>
						<Text size="14" color="primary" weight="500">{{
							nextArticle.title
						}}</Text>
					</Flex>
				</Flex>
			</Flex>
		</Flex>

		<TableOfContents
			v-if="docsStore.article.title && links.length"
			:title="docsStore.article.title"
			:links="links"
		/>
	</Flex>
</template>

<style module>
.content {
	width: 100%;
	max-width: 700px;
}

.nav {
	border-top: 1px solid var(--border);

	margin-top: 24px;
	padding-top: 24px;
}

.next_btn {
	cursor: pointer;
	border-radius: 8px;
	border: 2px solid var(--border);
	height: 68px;

	padding: 0 16px;
	margin-bottom: 150px;

	transition: all 0.2s ease;
}

.next_btn svg {
	transition: all 0.2s ease;
}

.next_btn:hover {
	border: 2px solid var(--border-highlight);
}

.next_btn:hover svg {
	fill: var(--text-primary);
}

@media (max-width: 900px) {
	.wrapper {
		flex-direction: column-reverse;
		gap: 32px;
	}
}
</style>
