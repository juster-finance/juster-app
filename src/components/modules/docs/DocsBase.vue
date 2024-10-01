<script setup>
/**
 * Vendor
 */
import { onMounted, ref, watch, reactive } from "vue"
import { useRoute, useRouter } from "vue-router"

/**
 * API
 */
import { fetchPosts, fetchSections } from "@/api/sanity"

/**
 * UI
 */
import { Dropdown, DropdownItem, DropdownDivider, DropdownTitle } from "@ui/Dropdown"

/**
 * Store
 */
import { useDocsStore } from "@store/docs"

const route = useRoute()
const router = useRouter()

const docsStore = useDocsStore()

const allPosts = ref([])
const generalLinks = ref([])

/** Custom Positions */
const positions = reactive([
	{
		section: "General",
		links: ["Discover", "Events", "Liquidity", "Withdraw", "Roadmap"],
	},
	{
		section: "Events",
		links: ["Price Events", "How to Stake", "Get a Payout", "Providing Liquidity"],
	},
	{
		section: "Pools",
		links: ["Overview", "Event Line", "Metrics", "Depositing liquidity", "Request withdrawal"],
	},
	{
		section: "Extra Topics",
		links: ["FAQ", "Glossary", "Wallets", "Concepts", "Markets", "My submissions", "Statistics", "Fees", "How to get Tezos"],
	},
])

onMounted(async () => {
	const sections = await fetchSections()
	const posts = await fetchPosts()

	allPosts.value = posts

	/** Sections */
	sections
		.sort((a, b) => {
			const aSectionIdx = positions.findIndex((p) => p.section.toLowerCase() === a.title.toLowerCase())
			const bSectionIdx = positions.findIndex((p) => p.section.toLowerCase() === b.title.toLowerCase())
			return aSectionIdx - bSectionIdx
		})
		.forEach((section) => {
			docsStore.sections[section.title] = []
		})

	generalLinks.value = posts
		.filter((a) => !a.section)
		.sort((a, b) => {
			const section = positions.find((p) => p.section === "General")
			const aPostIdx = section.links.findIndex((l) => l === a.title)
			const bPostIdx = section.links.findIndex((l) => l === b.title)
			return aPostIdx - bPostIdx
		})

	posts
		.filter((a) => a.section)
		.forEach((post) => {
			if (docsStore.sections[post.section.title]) {
				docsStore.sections[post.section.title].push(post)
			}
		})

	/** Sort posts */
	Object.keys(docsStore.sections).forEach((section) => {
		docsStore.sections[section] = docsStore.sections[section].sort((a, b) => {
			const aPosition = positions.find((p) => p.section.toLowerCase() === a.section.title.toLowerCase())
			const bPosition = positions.find((p) => p.section.toLowerCase() === b.section.title.toLowerCase())

			const aPostIdx = aPosition ? aPosition.links.findIndex((l) => l.toLowerCase() === a.title.toLowerCase()) : 0
			const bPostIdx = bPosition ? bPosition.links.findIndex((l) => l.toLowerCase() === b.title.toLowerCase()) : 0

			return aPostIdx - bPostIdx
		})
	})

	/** Select current */
	if (route.params.slug) {
		let postBySlug
		posts.forEach((post) => {
			if (post.slug.current == route.params.slug) postBySlug = post
		})

		if (postBySlug) {
			selectPost(postBySlug)
		} else {
			router.push("/docs")
		}
	}
})

watch(
	() => route.params,
	() => {
		const { slug } = route.params

		if (!docsStore.post.slug) {
			selectPost(allPosts.value.find((p) => p.slug.current === "discover"))
		} else if (slug !== docsStore.post.slug.current) {
			const newPost = allPosts.value.find((p) => slug === p.slug.current)
			if (newPost) selectPost(newPost)
		}
	},
)

const selectPost = (post) => {
	docsStore.post = post
}
</script>

<template>
	<div :class="$style.wrapper">
		<div :class="$style.nav">
			<transition name="fade">
				<Flex v-if="generalLinks.length" direction="column" gap="40">
					<div :class="$style.general_links">
						<router-link
							v-for="(generalLink, gIndex) in generalLinks"
							:key="gIndex"
							:to="`/docs/${generalLink.slug.current}`"
							:class="[$style.general_link, docsStore.post.slug?.current === generalLink.slug.current && $style.active]"
						>
							<div :class="$style.icon">
								<Icon :name="generalLink.icon" size="16" />
							</div>

							{{ generalLink.title }}
						</router-link>
					</div>

					<div v-for="(section, index) in docsStore.sections" :key="section" :class="$style.section">
						<div :class="$style.title">{{ index }}</div>

						<router-link
							v-for="post in section"
							:key="post._id"
							:to="post.slug.current"
							:class="[$style.link, docsStore.post == post && $style.active]"
						>
							<Flex align="center" gap="8">
								{{ post.title }}

								<Text v-if="post.new" size="12" weight="600" color="brand" :class="$style.badge"> New </Text>
							</Flex>
						</router-link>
					</div>
				</Flex>
			</transition>
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
					<div :class="$style.dropdown_content">
						<router-link v-for="link in generalLinks" :key="link.slug.current" :to="`/docs/${link.slug.current}`">
							<DropdownItem>
								<Icon :name="link.icon" size="16" color="secondary" />
								{{ link.title }}
							</DropdownItem>
						</router-link>
						<DropdownDivider />
						
						<template v-for="(section, sectionName) in docsStore.sections" :key="sectionName">
							<DropdownTitle >{{ sectionName }}</DropdownTitle>
							<router-link v-for="link in section" :key="link.slug.current" :to="`/docs/${link.slug.current}`">
								<DropdownItem>
									{{ link.title }}
								</DropdownItem>
							</router-link>
							<DropdownDivider />
						</template>
					</div>
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

.badge {
	border-radius: 4px;
	background: rgba(238, 91, 70, 0.1);

	padding: 2px 4px;
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

.dropdown_content {
	overflow: auto;
    max-height: 50vh;
}
</style>
