<script setup>
/**
 * Vendor
 */
import { ref, onMounted } from "vue"
import { useMeta } from "vue-meta"
import { useRoute } from "vue-router"
import { DateTime } from "luxon"

/**
 * API
 */
import { fetchArticleBySlug } from "@/api/sanity"

/**
 * Services
 */
import { getSanityImageUrl } from "@/services/sanity"

/**
 * Modules
 */
import ArticleContent from "@modules/docs/ArticleContent.vue"

/** Meta */
const { meta } = useMeta({
	title: "",
	description: "",
})

const route = useRoute()

const article = ref(null)

onMounted(async () => {
	article.value = await fetchArticleBySlug(route.params.slug)

	meta.title = article.value.title
	meta.description = article.value.content[0].children[0].text
})
</script>

<template>
	<div v-if="article">
		<metainfo>
			<template #title="{ content }">{{ content }} • Juster</template>
		</metainfo>

		<Flex align="center" gap="8" :class="$style.head">
			<Text size="16" weight="600" color="tertiary">
				<router-link to="/blog" :class="$style.link">
					Blog
				</router-link>
			</Text>

			<Icon
				name="arrow"
				size="16"
				color="tertiary"
				style="rotate: -90deg"
			/>

			<Text size="16" weight="600" color="primary">
				{{ article.title }}
			</Text>
		</Flex>

		<Flex direction="column" align="center" gap="60">
			<img
				:src="getSanityImageUrl(article.poster)"
				:class="$style.cover"
			/>

			<Flex direction="column" gap="24" align="center">
				<Flex align="center" gap="8">
					<Flex align="center" gap="8">
						<Icon name="logo_symbol" size="20" color="brand" />
						<Text size="14" weight="500" color="primary">
							Juster Team
						</Text>
					</Flex>

					<Icon name="dot" size="16" style="fill: var(--border)" />

					<Text size="14" weight="500" color="tertiary">
						{{
							DateTime.fromISO(article._updatedAt).toFormat(
								"dd LLL, y",
							)
						}}
					</Text>
				</Flex>

				<h1>
					<Text size="32">{{ article.title }}</Text>
				</h1>
			</Flex>

			<ArticleContent
				:content="article.content"
				:class="$style.content"
			/>
		</Flex>
	</div>
</template>

<style module>
.head {
	border-bottom: 1px solid var(--border);

	padding-bottom: 16px;
	margin-bottom: 24px;
}

.link {
	transition: color 0.2s ease;
}

.link:hover {
	color: var(--text-primary);
}

.link:focus {
	box-shadow: 0 0 0 transparent;
	color: var(--text-primary);
}

.cover {
	width: 100%;
	aspect-ratio: 16/9;

	border-radius: 12px;
	background: var(--card-bg);
	box-shadow: 0px 30px 60px -30px rgba(0, 0, 0, 0.15),
		0px 50px 100px -20px rgba(0, 0, 0, 0.15);

	margin-bottom: 50px;

	transition: all 0.2s ease;
}

.cover:hover {
	box-shadow: 0 0 0 0 transparent, 0 0 0 0 transparent;
	transform: translateY(5px);
}

.content {
	max-width: 700px;
}
</style>
