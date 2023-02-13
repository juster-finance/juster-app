<script setup>
/**
 * Vendor
 */
import { computed } from "vue"
import { DateTime } from "luxon"

/**
 * Modules
 */
import ArticleContent from "@modules/docs/ArticleContent.vue"

const props = defineProps({ release: { type: Object } })
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
					<div :class="$style.dot" />
				</div>

				<div :class="$style.line" />
			</div>

			<div :class="$style.cover" />

			<ArticleContent :content="release.content" />
		</div>
	</Flex>
</template>

<style module>
.card {
	width: 100%;

	position: relative;
}

.cover {
	width: 700px;
	aspect-ratio: 16/9;

	background: rgba(255, 255, 255, 0.03);

	border-radius: 16px;

	margin-bottom: 32px;
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
	background: var(--orange);
	box-shadow: 0px 0px 15px var(--orange);
}

.line {
	width: 1px;
	height: 500px;
	background: linear-gradient(var(--border), transparent);

	margin-right: 5px;
}
</style>
