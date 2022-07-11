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

			<h2 :class="$style.title">{{ release.title }}</h2>

			<div v-html="content" :class="$style.body_preview" />
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

	position: relative;
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
