<script setup>
/**
 * Vendor
 */
import { DateTime } from "luxon"

/**
 * Services
 */
import { getSanityImageUrl } from "@/services/sanity"

/**
 * Modules
 */
import ArticleContent from "@modules/docs/ArticleContent.vue"

const props = defineProps({ release: { type: Object }, idx: Number })
</script>

<template>
	<Flex direction="column" gap="10">
		<div :class="$style.card">
			<div :class="$style.timeline">
				<div :class="$style.moment">
					{{
						DateTime.fromISO(release._createdAt, {
							locale: "en",
						}).toRelative()
					}}
					<div :class="[$style.dot, idx === 0 && $style.orange]" />
				</div>

				<div :class="$style.line" />
			</div>

			<img
				:src="getSanityImageUrl(release.poster)"
				:class="$style.cover"
			/>

			<ArticleContent :content="release.content" />

			<Text size="12" weight="500" color="tertiary">
				{{
					DateTime.fromISO(release._createdAt, {
						locale: "en",
					}).toRelative()
				}}
			</Text>
		</div>
	</Flex>
</template>

<style module>
.card {
	width: 100%;

	position: relative;
}

.cover {
	width: 100%;
	aspect-ratio: 16/9;
	margin-bottom: 50px;

	background: rgba(255, 255, 255, 0.03);

	border-radius: 16px;
}

.timeline {
	position: absolute;

	top: 0;
	right: 760px;

	display: flex;
	align-items: flex-end;
	flex-direction: column;
}

.moment {
	display: flex;
	align-items: center;
	gap: 16px;

	font-size: 13px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-tertiary);
	white-space: nowrap;
}

.dot {
	width: 10px;
	height: 10px;
	border-radius: 50%;
	background: var(--border);
}

.dot.orange {
	background: var(--orange);
	box-shadow: 0px 0px 15px var(--orange);
}

.line {
	width: 1px;
	height: 500px;
	background: linear-gradient(var(--border), transparent);

	margin-right: 5px;
}

@media (max-width: 1100px) {
	.timeline {
		display: none;
	}
}

@media (max-width: 700px) {
	.cover {
		margin-bottom: 0;
	}
}
</style>
