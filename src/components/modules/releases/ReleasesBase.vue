<script setup>
/**
 * Vendor
 */
import { ref, onMounted } from "vue"
import { useMeta } from "vue-meta"

/**
 * UI
 */
import Button from "@ui/Button.vue"

/**
 * API
 */
import { fetchReleases } from "@/api/sanity"

/**
 * Local
 */
import ReleaseCard from "./ReleaseCard.vue"

const releases = ref([])

/** Meta */
useMeta({
	title: "Releases",
	description: "New updates and improvements to Juster.",
})

onMounted(async () => {
	releases.value = await fetchReleases()
})
</script>

<template>
	<div :class="$style.wrapper">
		<metainfo>
			<template #title="{ content }">{{ content }} • Juster</template>
		</metainfo>

		<div :class="$style.base">
			<h1 :class="$style.title">What's New</h1>
			<div :class="$style.description">
				Join our Discord or Twitter to keep up with new updates
			</div>

			<div :class="$style.buttons">
				<a href="https://discord.gg/FeGDCkHhnB" target="_blank">
					<Button type="secondary" size="small">
						<Icon name="discord" size="16" />Discord Server
					</Button>
				</a>
				<a href="https://twitter.com/Juster_fi" target="_blank">
					<Button type="secondary" size="small">
						<Icon name="twitter" size="16" />Twitter
					</Button>
				</a>
			</div>

			<div :class="$style.releases">
				<ReleaseCard
					v-for="(release, idx) in releases"
					:key="release._id"
					:release="release"
					:idx="idx"
					:class="$style.card"
				/>
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

	max-width: 700px;
}

.title {
	font-size: 42px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-primary);

	margin-top: 2em;
	margin-bottom: 1em;
}

.description {
	font-size: 16px;
	line-height: 1.6;
	font-weight: 500;
	color: var(--text-secondary);

	margin-bottom: 20px;
}

.buttons {
	display: flex;
	align-items: center;
	gap: 8px;

	margin-bottom: 80px;
}

.releases {
	display: flex;
	flex-direction: column;
	gap: 80px;
}

@media (max-width: 700px) {
	.title {
		font-size: 24px;
	}

	.description {
		font-size: 14px;
	}
}
</style>
