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
	margin: 0 0 1em 0;
}

.wrapper h2 {
	margin: 2em 0 1em 0;
}

.wrapper h3 {
	margin: 2em 0 1em 0;
}

.wrapper h4 {
	margin: 2em 0 1em 0;
}

.wrapper p {
	font-size: 16px;
	line-height: 1.6;
	color: var(--text-secondary);

	margin: 0.8em 0 1.2em 0;
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

.wrapper strong {
	color: var(--text-primary);
	font-weight: 600;
}
</style>
