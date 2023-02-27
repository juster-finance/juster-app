<script setup>
/**
 * Vendor
 */
import { ref } from "vue"

const props = defineProps({
	title: { type: String, default: "Juster Documentation" },
	links: Array,
})

const expand = ref(false)

const generateHref = (text) => {
	return text
		.toString()
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/[^\w\-]+/g, "")
		.replace(/\-\-+/g, "-")
		.replace(/^-+/, "")
		.replace(/-+$/, "")
}
</script>

<template>
	<div :class="$style.wrapper">
		<div :class="$style.base">
			<div @click="expand = !expand" :class="$style.label">
				<Flex align="center" gap="6">
					Content

					<Icon
						name="arrow"
						size="14"
						color="tertiary"
						:style="{ transform: `rotate(${expand ? 180 : 0}deg)` }"
						:class="$style.mobile_arrow"
					/>
				</Flex>
			</div>

			<div :class="[$style.content, $style.mobile, expand && $style.expand]">
				<Text size="14" weight="600" color="primary">
					{{ title }}
				</Text>

				<ul>
					<li v-for="link in links" :style="{ paddingLeft: `${(link.level - 2) * 10}px` }">
						<a :href="`#${generateHref(link.text)}`">{{ link.text }}</a>
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>

<style module>
.wrapper {
	position: relative;
	min-width: 200px;
	flex-grow: 1;

	padding-left: 70px;
}

.wrapper * {
	white-space: nowrap;
}

.base {
	display: flex;
	flex-direction: column;
	gap: 20px;

	opacity: 0.4;

	position: sticky;
	top: 130px;

	transition: opacity 0.2s ease;
}

.wrapper:hover .base {
	opacity: 1;
}

.label {
	font-size: 14px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-secondary);
}

.wrapper ul {
	display: flex;
	flex-direction: column;

	padding-inline-start: 0px;
	list-style-type: none;

	margin: 8px 0 8px 0;
}

.wrapper li {
	font-size: 14px;
	line-height: 1;
	font-weight: 500;
	color: var(--text-tertiary);

	display: block;
	overflow: hidden;
	text-overflow: ellipsis;

	transition: color 0.2s ease;
}

.wrapper li:hover {
	color: var(--text-secondary);
}

.wrapper li a {
	display: flex;
	padding: 8px 0;
}

.mobile_arrow {
	display: none;
}

@media (max-width: 900px) {
	.wrapper {
		padding-left: 0;
	}
}

@media (max-width: 600px) {
	.mobile {
		display: none;
	}

	.expand {
		display: initial;
	}

	.mobile_arrow {
		display: initial;
	}
}
</style>
