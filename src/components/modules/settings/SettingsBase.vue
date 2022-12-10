<script setup>
/**
 * Vendor
 */
import { ref } from "vue"
import { useMeta } from "vue-meta"
import { useRouter, useRoute } from "vue-router"

const router = useRouter()
const route = useRoute()

const activeLink = ref(route.name.replace("Settings", ""))
const blocks = ref([
	{
		title: "",
		links: [
			{
				name: "Account",
				icon: "user",
				path: "/account",
			},
			{
				name: "Application",
				icon: "logo_symbol",
				path: "/application",
			},
			{
				name: "Wallet",
				icon: "login",
				path: "/wallet",
			},
		],
	},
	{
		title: "Appearance",
		links: [
			{
				name: "Display",
				icon: "display",
				path: "/display",
			},
			{
				name: "Amounts",
				icon: "amounts",
				path: "/amounts",
			},
			{
				name: "Theme",
				icon: "palette",
				path: "/theme",
			},
		],
	},
	{
		title: "Accessibility",
		links: [
			{
				name: "Search",
				icon: "italic",
				path: "/search",
			},
			{
				name: "Effects",
				icon: "waves",
				path: "/effects",
			},
			{
				name: "Shortcuts",
				icon: "keyboard",
				path: "/shortcuts",
				disabled: true,
			},
		],
	},
	{
		title: "Other",
		links: [
			{
				name: "Advanced",
				icon: "tool",
				path: "/advanced",
			},
			{
				name: "Releases",
				icon: "asterisk",
				path: "/releases",
			},
			{
				name: "Debugging",
				icon: "console",
				path: "/debugging",
			},
			{
				name: "Resets",
				icon: "flip_back",
				path: "/resets",
			},
		],
	},
])

const handleLinkClick = (link) => {
	if (link.disabled) return

	activeLink.value = link.name
	router.push(`/settings${link.path}`)
}

/** Meta */
const { meta } = useMeta({
	title: `Settings`,
})
</script>

<template>
	<Flex align="center" :class="$style.head">
		<h1 :class="$style.title">Settings</h1>
	</Flex>

	<Flex gap="60">
		<Flex direction="column" gap="4" :class="$style.side">
			<Flex v-for="block in blocks" direction="column" gap="4">
				<Text
					v-if="block.title"
					size="12"
					weight="600"
					color="support"
					:class="$style.block_title"
				>
					{{ block.title }}
				</Text>
				<Flex
					v-for="link in block.links"
					@click="handleLinkClick(link)"
					align="center"
					gap="8"
					:class="[
						$style.link,
						activeLink === link.name && $style.active,
						link.disabled && $style.disabled,
					]"
					tabindex="1"
				>
					<Icon :name="link.icon" size="16" color="tertiary" />
					<Text size="14" weight="600" color="primary">
						{{ link.name }}
					</Text>

					<Transition name="fastfade">
						<div
							v-if="activeLink === link.name"
							:class="$style.selector"
						/>
					</Transition>
				</Flex>
			</Flex>
		</Flex>

		<div :class="$style.content">
			<router-view />
		</div>
	</Flex>
</template>

<style module>
.head {
	border-bottom: 1px solid var(--border);

	padding-bottom: 16px;
	margin-bottom: 24px;
}

.title {
	font-size: 16px;
}

.side {
	width: 220px;
}

.content {
	width: 490px;
}

.block_title {
	height: 36px;

	padding: 16px 0 8px 10px;
}

.link {
	position: relative;
	width: 100%;
	height: 36px;

	border-radius: 8px;
	cursor: pointer;

	padding: 0 10px;

	transition: all 0.2s ease;
}

.link.active {
	background: rgba(255, 255, 255, 0.05);
}

.link.disabled {
	opacity: 0.3;
	pointer-events: none;
}

.link:hover {
	background: rgba(255, 255, 255, 0.05);
}

.link:focus {
	outline: none;
	background: rgba(255, 255, 255, 0.05);
}

.selector {
	position: absolute;
	top: 50%;
	right: 8px;
	transform: translateY(-50%) translateX(-50%);

	width: 4px;
	height: 20px;

	border-radius: 50px;
	background: var(--blue);
}
</style>
