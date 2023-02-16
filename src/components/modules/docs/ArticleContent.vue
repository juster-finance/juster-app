<script setup>
/**
 * Vendor
 */
import { reactive } from "vue"

/**
 * Sanity Components
 */
import Blockquote from "@sanity/Blockquote.vue"
import Image from "@sanity/Image.vue"
import Banner from "@sanity/Banner.vue"
import Collapse from "@sanity/Collapse.vue"
import Link from "@sanity/Link.vue"
import Code from "@sanity/Code.vue"
import CodeBlock from "@sanity/CodeBlock.vue"
import List from "@sanity/List.vue"
import ListItem from "@sanity/ListItem.vue"
import HeaderAnchor from "./HeaderAnchor.vue"

/**
 * Utils
 */
import PortableText from "@utils/render.js"

const props = defineProps({
	title: String,
	content: Array,
})

const serializers = reactive({
	types: {
		image: Image,
		banner: Banner,
		collapse: Collapse,
		codeBlock: CodeBlock,
	},
	styles: {
		blockquote: Blockquote,
		h2: HeaderAnchor,
		h3: HeaderAnchor,
		h4: HeaderAnchor,
	},
	marks: {
		code: Code,
		link: Link,
	},
	list: List,
	listItem: ListItem,
})
</script>

<template>
	<div :class="$style.wrapper">
		<h1 v-if="title">{{ title }}</h1>
		<PortableText :blocks="content" :serializers="serializers" />
	</div>
</template>

<style module>
.wrapper {
}

.wrapper h1 {
	margin-bottom: 24px;
}

.wrapper h2 {
	margin-bottom: 16px;
}

.wrapper h3 {
	margin-bottom: 14px;
}

.wrapper h4 {
	margin-bottom: 12px;
}

.wrapper p {
	font-size: 16px;
	line-height: 1.6;
	color: var(--text-secondary);

	margin-bottom: 40px;
}

.wrapper blockquote p {
	font-size: 14x;
	color: var(--text-tertiary);
}

.wrapper blockquote p strong {
	color: var(--text-primary);
	font-weight: 500;
}

.wrapper p a {
	color: var(--text-blue);
}

.wrapper ul {
	padding-inline-start: 20px;
	list-style-type: disc;

	margin-bottom: 24px;
}

.wrapper ul li {
	font-size: 16px;
	line-height: 1.6;
	color: var(--text-secondary);

	padding-inline-start: 0.5ch;
	margin-bottom: 16px;
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
