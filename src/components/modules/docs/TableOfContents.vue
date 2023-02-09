<script setup>
const props = defineProps({
	title: { type: String, default: "Juster Documentation" },
	links: Array,
})

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
			<div :class="$style.label">Content</div>

			<div :class="$style.content">
				<Text size="14" weight="600" color="primary">
					{{ title }}
				</Text>

				<ul>
					<li
						v-for="link in links"
						:style="{ paddingLeft: `${(link.level - 2) * 10}px` }"
					>
						<a :href="`#${generateHref(link.text)}`">{{
							link.text
						}}</a>
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>

<style module>
.wrapper {
	min-width: 200px;
	position: relative;

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

@media (max-width: 900px) {
	.wrapper {
		padding-left: 0;
	}
}
</style>
