<script>
import { computed, defineComponent, toRefs, ref } from "vue"

import Markdown from "markdown-it"

export default defineComponent({
	name: "ArticleContent",
	props: {
		source: {
			type: String,
			required: true,
		},
	},

	setup(props) {
		const { source } = toRefs(props)

		const md = ref(null)

		md.value = new Markdown({ html: true })

		const content = computed(() => md.value.render(source.value))

		return { content }
	},
})
</script>

<template>
	<div v-html="content" :class="$style.wrapper" />
</template>

<style module>
.wrapper {
}

.wrapper h1 {
	margin-bottom: 24px;
}

.wrapper h2 {
	cursor: pointer;
	margin-bottom: 24px;
}

.wrapper h2::after {
	content: "";
	position: relative;
	top: 2px;
	display: inline-block;
	width: 16px;
	height: 16px;
	background: url("~@/assets/icons/anchor.svg") no-repeat;
	background-size: 100% 100%;
	margin-left: 8px;
	opacity: 0;

	transition: opacity 0.2s ease;
}

.wrapper h2:hover::after {
	opacity: 0.5;
}

.wrapper p {
	font-size: 15px;
	line-height: 1.6;
	color: var(--text-secondary);

	margin-bottom: 40px;
}

.wrapper blockquote p {
	font-size: 14px;
	color: var(--text-tertiary);
}

.wrapper blockquote p strong {
	color: var(--text-primary);
	font-weight: 500;
}

.wrapper ul {
	padding-inline-start: 20px;

	margin-bottom: 24px;
}

.wrapper ul li {
	font-size: 15px;
	line-height: 1.6;
	color: var(--text-secondary);

	list-style-type: "—";
	padding-inline-start: 1ch;

	margin-bottom: 4px;
}

.wrapper ol {
	padding-inline-start: 20px;

	margin-bottom: 24px;
}

.wrapper ol li {
	font-size: 15px;
	line-height: 1.6;
	color: var(--text-secondary);

	margin-bottom: 4px;
}
</style>
