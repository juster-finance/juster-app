<script setup>
/**
 * Vendor
 */
import { ref, onMounted, computed } from "vue"
import { useMeta } from "vue-meta"
import { DateTime } from "luxon"

/**
 * API
 */
import { fetchArticles } from "@/api/sanity"

/**
 * Services
 */
import { getSanityImageUrl } from "@/services/sanity"

/** Meta */
useMeta({
	title: "Blog",
	description:
		"Learn about new features, development approaches, financial tools, and dive into releases.",
})

const articles = ref([])

onMounted(async () => {
	articles.value = await fetchArticles()
})

const freshArticle = computed(() => articles.value[0])
</script>

<template>
	<div v-if="articles.length">
		<metainfo>
			<template #title="{ content }">{{ content }} • Juster</template>
		</metainfo>

		<Flex justify="between" align="center">
			<h1 :class="$style.title">Blog</h1>
		</Flex>

		<div :class="$style.divider" />

		<router-link :to="`/blog/${freshArticle.slug.current}`">
			<Flex align="center" direction="column" :class="$style.large_post">
				<img
					:src="getSanityImageUrl(freshArticle.poster)"
					:class="$style.cover"
				/>

				<Flex
					direction="column"
					align="center"
					gap="8"
					:class="$style.content"
				>
					<Text size="14" weight="600" color="blue">{{
						freshArticle.tag
					}}</Text>
					<h1>{{ freshArticle.title }}</h1>
					<div :class="$style.body">
						{{ freshArticle.content[0].children[0].text }}
					</div>
				</Flex>

				<Flex align="center" gap="8" :class="$style.metadata">
					<Flex align="center" gap="8">
						<Icon name="logo_symbol" size="20" color="brand" />
						<Text size="14" weight="500" color="primary">
							Juster Team
						</Text>
					</Flex>

					<Icon name="dot" size="16" style="fill: var(--border)" />

					<Text size="14" weight="500" color="tertiary">
						{{
							DateTime.fromISO(freshArticle._updatedAt).toFormat(
								"dd LLL, y",
							)
						}}
					</Text>
				</Flex>
			</Flex>
		</router-link>

		<Flex wrap="wrap" justify="between" :class="$style.posts">
			<router-link
				v-for="article in articles.slice(1, articles.length)"
				:to="`/blog/${article.slug.current}`"
			>
				<Flex direction="column" :class="$style.post">
					<img
						:src="getSanityImageUrl(article.poster)"
						:class="$style.cover"
					/>

					<Flex direction="column" gap="8" :class="$style.content">
						<Text size="14" weight="600" color="blue">{{
							article.tag
						}}</Text>
						<h1>{{ article.title }}</h1>
						<div :class="$style.body">
							{{ article.content[0].children[0].text }}
						</div>
					</Flex>

					<Flex align="center" gap="8" :class="$style.metadata">
						<Flex align="center" gap="8">
							<Icon name="logo_symbol" size="20" color="brand" />
							<Text size="14" weight="500" color="primary">
								Juster Team
							</Text>
						</Flex>

						<Icon
							name="dot"
							size="16"
							style="fill: var(--border)"
						/>

						<Text size="14" weight="500" color="tertiary">
							{{
								DateTime.fromISO(
									freshArticle._updatedAt,
								).toFormat("dd LLL, y")
							}}
						</Text>
					</Flex>
				</Flex>
			</router-link>
		</Flex>
	</div>
</template>

<style module>
.title {
	font-size: 16px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-primary);
}

.moon {
	fill: var(--blue);
	cursor: pointer;
}

.divider {
	width: 100%;
	height: 1px;
	background: var(--border);

	margin: 16px 0 32px 0;
}

.large_post {
	margin-bottom: 140px;
}

.post {
	max-width: 480px;

	margin-bottom: 80px;
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

.post .cover {
	margin-bottom: 40px;
	box-shadow: initial;
}

.content {
	max-width: 600px;
}

.large_post h1 {
	font-size: 36px;
	line-height: 1.8;
	font-weight: 600;
	color: var(--text-primary);
	text-align: center;
}

.post h1 {
	font-size: 24px;
	line-height: 1.8;
	font-weight: 600;
	color: var(--text-primary);
}

.large_post .body {
	font-size: 18px;
	line-height: 1.6;
	font-weight: 500;
	color: var(--text-secondary);
	text-align: center;
}

.post .body {
	font-size: 15px;
	line-height: 1.6;
	font-weight: 500;
	color: var(--text-secondary);
}

.metadata {
	margin-top: 24px;
}

@media (max-width: 700px) {
	.large_post h1 {
		font-size: 24px;
	}

	.large_post .body {
		font-size: 14px;
	}
}
</style>
