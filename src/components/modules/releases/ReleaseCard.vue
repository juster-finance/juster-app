<script setup>
import { ref, computed } from "vue"
import { DateTime } from "luxon"
import Markdown from "markdown-it"

const props = defineProps({ release: { type: Object } })

const md = ref(null)
md.value = new Markdown({ html: true })

const firstParagraphRegex = /\<p>(.*?)\<\/p>/
const content = computed(
	() => firstParagraphRegex.exec(md.value.render(props.release.Body))[0],
)
</script>

<template>
	<router-link
		:to="`/releases/${release.slug.current}`"
		:class="$style.wrapper"
	>
		<div>
			<div :class="$style.card">
				<div :class="$style.cover" />

				<div :class="$style.when">
					{{
						DateTime.fromISO(release._updatedAt, {
							locale: "en",
						}).toFormat("dd LLL, kkkk")
					}}
				</div>

				<h2 :class="$style.title">{{ release.title }}</h2>

				<div v-html="content" :class="$style.body_preview" />
			</div>
		</div>
	</router-link>
</template>

<style module>
.wrapper {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.card {
	width: 100%;
}

.cover {
	width: 700px;
	aspect-ratio: 16/9;

	background: rgba(255, 255, 255, 0.03);

	border-radius: 16px;

	margin-bottom: 32px;
}

.title {
	font-size: 24px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-primary);

	margin-bottom: 16px;
}

.body_preview {
	font-size: 16px;
	line-height: 1.6;
	font-weight: 400;
	color: var(--text-tertiary);

	margin-bottom: 20px;
}

.when {
	font-size: 12px;
	font-weight: 700;
	color: var(--text-tertiary);
	text-transform: uppercase;

	margin-bottom: 16px;
}
</style>
