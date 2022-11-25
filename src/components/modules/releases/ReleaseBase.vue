<script>
import { computed, defineComponent, onMounted, ref } from "vue"
import { useMeta } from "vue-meta"
import { useRoute } from "vue-router"
import Markdown from "markdown-it"

/**
 * UI
 */
import Button from "@ui/Button.vue"

/**
 * API
 */
import { fetchReleases } from "@/api/sanity"

/**
 * Store
 */
import { useReleasesStore } from "@store/releases"

export default defineComponent({
	name: "ReleaseBase",

	setup() {
		const route = useRoute()

		/** Meta */
		useMeta({
			title: "Releases",
			description: "New updates and improvements to Juster.",
		})

		const releasesStore = useReleasesStore()

		onMounted(async () => {
			if (!releasesStore.all.length)
				releasesStore.all = await fetchReleases()
		})

		const release = computed(() =>
			releasesStore.all.find(
				(release) => release.slug.current == route.params.slug,
			),
		)

		const md = ref(null)
		md.value = new Markdown({ html: true })

		const body = computed(() => md.value.render(release.value.Body))

		return { release, body }
	},

	components: {
		Button,
	},
})
</script>

<template>
	<div :class="$style.wrapper">
		<metainfo>
			<template v-slot:title="{ content }"
				>{{ content }} • Juster</template
			>
		</metainfo>

		<div :class="$style.base">
			<h1 :class="$style.title">{{ release.title }}</h1>

			<router-link to="/releases" :class="$style.back">
				<Icon name="back" size="14" />Back to All releases
			</router-link>

			<div :class="$style.badges">
				<div :class="$style.badge">
					<Icon name="eye" size="14" />
					<span
						>{{
							Math.ceil(release.Body.split(" ").length / 200)
						}}
						min</span
					>
					read
				</div>

				<div :class="$style.dot" />

				<div :class="$style.badge">
					<Icon name="branch" size="14" />
					<span>Minor</span> Update
				</div>

				<div :class="$style.dot" />

				<div :class="$style.badge">
					<Icon name="calendar" size="14" />
					{{ new Date(release._updatedAt).toDateString() }}
				</div>
			</div>

			<div v-html="body" :class="$style.body" />

			<div :class="$style.buttons">
				<a href="https://discord.gg/FeGDCkHhnB" target="_blank">
					<Button type="secondary" size="small"
						><Icon name="discord" size="16" />Join our Discord
						Server</Button
					></a
				>
				<a href="https://twitter.com/Juster_fi" target="_blank">
					<Button type="secondary" size="small"
						><Icon name="twitter" size="16" />Read our
						Twitter</Button
					>
				</a>
			</div>
		</div>
	</div>
</template>

<style module>
.wrapper {
	display: flex;
	justify-content: center;
}

.base {
	display: flex;
	flex-direction: column;

	width: 700px;
}

.title {
	font-size: 42px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-primary);

	margin-top: 40px;
	margin-bottom: 60px;
}

.back {
	display: flex;
	align-items: center;
	gap: 6px;

	font-size: 13px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-blue);
	fill: var(--text-blue);
	cursor: pointer;

	margin-bottom: 24px;

	transition: color 0.2s ease;
}

.back:hover {
	color: var(--blue);
}

.badges {
	display: flex;
	align-items: center;
	gap: 12px;

	margin-bottom: 24px;
}

.dot {
	width: 4px;
	height: 4px;
	border-radius: 50%;
	background: var(--text-tertiary);
}

.badge {
	display: flex;
	align-items: center;
	gap: 8px;

	fill: var(--text-tertiary);

	font-size: 14px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-tertiary);
}

.badge span {
	color: var(--text-secondary);
}

.body p {
	font-size: 16px;
	line-height: 1.6;
	font-weight: 400;
	color: var(--text-secondary);

	margin-bottom: 24px;
}

.body h2 {
	margin-bottom: 16px;
	margin-top: 40px;
}

.body ul {
	padding-inline-start: 26px;

	margin-bottom: 24px;
}

.body li {
	font-size: 16px;
	line-height: 1.6;
	font-weight: 400;
	color: var(--text-secondary);

	margin-bottom: 16px;
}

.body li strong {
	color: var(--text-primary);
}

.body li::marker {
}

.body hr {
	border-color: var(--opacity-10);

	margin: 60px auto 60px auto;
}

.body a {
	color: var(--text-blue);

	transition: color 0.2s ease;
}

.body a:hover {
	color: var(--blue);
}

.buttons {
	display: flex;
	align-items: center;
	gap: 8px;

	margin-top: 40px;
}
</style>
