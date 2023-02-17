<script setup>
/**
 * Vendor
 */
import { onMounted, onBeforeUnmount, ref, watch, computed } from "vue"
import { DateTime } from "luxon"

/**
 * UI
 */
import Tooltip from "@ui/Tooltip.vue"

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
	document.addEventListener("keydown", onKeydown)

	if (!docsStore.post.content) return
	createLinksStructure()
})

onBeforeUnmount(() => {
	document.removeEventListener("keydown", onKeydown)
})

watch(
	() => docsStore.post,
	() => {
		createLinksStructure()
	},
)

const createLinksStructure = () => {
	links.value = docsStore.post.content
		.filter((block) => block.style?.startsWith("h"))
		.map((block) => {
			return {
				text: block.children[0].text,
				level: block.style.replace("h", ""),
			}
		})
}

/** Handle ArrowLeft / ArrowRight navigation */
const onKeydown = (e) => {
	if (e.key === "ArrowLeft") {
		handlePrevPage()
	}

	if (e.key === "ArrowRight") {
		handleNextPage()
	}
}

const nextPost = computed(() => {
	if (!docsStore.post.section) return

	const currentSection = docsStore.post.section.title
	const selectedPostIndex = docsStore.sections[currentSection].indexOf(
		docsStore.post,
	)

	if (docsStore.sections[currentSection][selectedPostIndex + 1]) {
		return docsStore.sections[currentSection][selectedPostIndex + 1]
	} else {
		const allSections = Object.keys(docsStore.sections)
		const currentSectionIndex = allSections.indexOf(currentSection)

		return (
			docsStore.sections[allSections[currentSectionIndex + 1]] &&
			docsStore.sections[allSections[currentSectionIndex + 1]][0]
		)
	}
})

const prevPost = computed(() => {
	if (!docsStore.post.section) return

	const currentSection = docsStore.post.section.title
	const selectedPostIndex = docsStore.sections[currentSection].indexOf(
		docsStore.post,
	)

	if (docsStore.sections[currentSection][selectedPostIndex - 1]) {
		return docsStore.sections[currentSection][selectedPostIndex - 1]
	} else {
		const allSections = Object.keys(docsStore.sections)
		const currentSectionIndex = allSections.indexOf(currentSection)
		const prevSection =
			docsStore.sections[allSections[currentSectionIndex - 1]]

		return prevSection && prevSection[prevSection.length - 1]
	}
})

const handleNextPage = () => {
	if (!nextPost.value) return

	docsStore.post = nextPost.value

	document.getElementById("app").scrollTo({
		top: 0,
		behavior: "smooth",
	})
}

const handlePrevPage = () => {
	if (!prevPost.value) return

	docsStore.post = prevPost.value

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
				v-if="docsStore.post.content"
				:title="docsStore.post.title"
				:content="docsStore.post.content"
			/>

			<Text
				v-if="docsStore.post._updatedAt"
				size="13"
				weight="500"
				color="support"
			>
				Last updated
				{{
					DateTime.fromISO(docsStore.post._updatedAt)
						.setLocale("en")
						.toFormat("FF")
				}}
			</Text>

			<Flex align="center" gap="32" :class="$style.nav">
				<Tooltip v-if="prevPost" isWide>
					<Flex
						@click="handlePrevPage"
						align="center"
						justify="between"
						:class="$style.next_btn"
					>
						<Flex direction="column" gap="8">
							<Text size="12" color="tertiary" weight="500">
								Previous Page
							</Text>
							<Text size="14" color="primary" weight="500">{{
								prevPost.title
							}}</Text>
						</Flex>

						<Icon name="arrowleft" size="16" color="tertiary" />
					</Flex>

					<template #content>
						<span>Use</span>
						{{ "<-" }}
						<span> key to go back</span>
					</template>
				</Tooltip>

				<Tooltip v-if="nextPost" isWide placement="bottom">
					<Flex
						@click="handleNextPage"
						align="center"
						justify="between"
						:class="$style.next_btn"
					>
						<Icon name="arrowright" size="16" color="tertiary" />

						<Flex align="end" direction="column" gap="8">
							<Text size="12" color="tertiary" weight="500">
								Next Page
							</Text>
							<Text size="14" color="primary" weight="500">
								{{ nextPost.title }}
							</Text>
						</Flex>
					</Flex>

					<template #content>
						<span>Use</span>
						->
						<span> key to go forward</span>
					</template>
				</Tooltip>
			</Flex>
		</Flex>

		<TableOfContents
			v-if="docsStore.post.title && links.length"
			:title="docsStore.post.title"
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
	flex: 1;
	cursor: pointer;
	border-radius: 8px;
	border: 2px solid var(--border);
	height: 68px;

	padding: 0 16px;

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
