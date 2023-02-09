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
	},
	styles: {
		blockquote: Blockquote,
		h2: HeaderAnchor,
	},
})
</script>

<template>
	<div :class="$style.wrapper">
		<h1>{{ title }}</h1>
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
	cursor: pointer;

	margin-bottom: 16px;
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
