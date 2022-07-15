<script setup>
import { ref } from "vue"

/**
 * UI
 */
import Button from "@/components/ui/Button"

defineProps({
	activeLink: {
		type: String,
		default: "",
	},
})

const emit = defineEmits("onClick")

const browseLinks = ref([
	{
		icon: "compass",
		title: "Explore",
		description: "Hot Events, Ranking, Stats, etc",
		url: "/",
	},
	{
		icon: "arrows",
		title: "Events",
		description: "All events with advanced filters",
		url: "/events",
	},
	{
		icon: "layers",
		title: "Markets",
		description: "Available symbols for betting",
		url: "/markets",
	},
	{
		icon: "rank_crown",
		title: "Ranking",
		description: "Compete with other users",
		url: "/rank",
	},
])

const resourcesLinks = ref([
	{
		icon: "book",
		title: "Documentation",
		description: "Everything you need is here",
		url: "/",
	},
	{
		icon: "code",
		title: "Developers",
		description: "Learn the product in more detail",
		url: "/events",
	},
	{
		icon: "map",
		title: "Roadmap",
		description: "Explore the product path",
		url: "/markets",
	},
	{
		icon: "github",
		title: "Source Code",
		description: "Explore our code & Contribute",
		url: "/rank",
	},
])

const communityLinks = ref([
	{
		icon: "discord",
		title: "Discord",
		description: "Explore the product path",
		url: "/markets",
	},
	{
		icon: "twitter",
		title: "Twitter",
		description: "Explore our code & Contribute",
		url: "/rank",
	},
	{
		icon: "document",
		title: "Blog",
		description: "Everything you need is here",
		url: "/",
	},
	{
		icon: "spark",
		title: "Releases",
		description: "Learn the product in more detail",
		url: "/events",
	},
])
</script>

<template>
	<transition name="navpopup">
		<div
			v-if="activeLink.length"
			@click="emit('onClick')"
			:class="[$style.wrapper, activeLink.length && $style.animate]"
		>
			<div v-if="activeLink === 'Browse'" :class="$style.card">
				<div :class="$style.column">
					<div :class="$style.atlas_block">
						<div :class="$style.label">Participate</div>

						<router-link
							v-for="(link, i) in browseLinks"
							:key="i"
							:to="link.url"
							:class="$style.item"
						>
							<div :class="$style.icon_wrapper">
								<Icon :name="link.icon" size="20" />
							</div>

							<div :class="$style.text">
								<span>{{ link.title }}</span>
								<span>{{ link.description }}</span>
							</div>
						</router-link>
					</div>
				</div>

				<div :class="$style.divider" />

				<div :class="$style.column">
					<div :class="$style.advanced_block">
						<div :class="$style.label">advanced</div>

						<div :class="[$style.item, $style.disabled]">
							<Icon name="lock" size="20" />

							<div :class="$style.text">
								<span>Untitled Feature</span>
								<span>Coming soon!</span>
							</div>
						</div>
					</div>

					<div :class="$style.guides_block">
						<div :class="$style.label">featured guides</div>

						<div :class="$style.guide">
							<span>What are liquidity pools?</span>
							<span>Advanced</span>
						</div>

						<div :class="$style.guide">
							<span>Creating and managing events</span>
							<span>Advanced</span>
						</div>
					</div>

					<div :class="$style.buttons">
						<router-link to="/releases">
							<Button size="mini" type="secondary" block>
								<Icon
									name="spark"
									size="14"
									style="fill: var(--green)"
								/>Release 1.1
							</Button>
						</router-link>

						<div :class="$style.button_group">
							<Button size="mini" type="secondary" block>
								<Icon
									name="layers"
									size="14"
									style="fill: var(--orange)"
								/>All Features
							</Button>

							<Button
								size="mini"
								type="secondary"
								block
								as-link
								link="https://discord.gg/FeGDCkHhnB"
							>
								<Icon
									name="chat"
									size="14"
									style="fill: var(--text-primary)"
								/>Discussions
							</Button>
						</div>
					</div>
				</div>
			</div>
			<div v-if="activeLink === 'Resources'" :class="$style.card">
				<div :class="$style.column">
					<div :class="$style.atlas_block">
						<div :class="$style.label">learn</div>

						<div
							v-for="(link, i) in resourcesLinks"
							:key="i"
							:class="$style.item"
						>
							<Icon :name="link.icon" size="20" />

							<div :class="$style.text">
								<span>{{ link.title }}</span>
								<span>{{ link.description }}</span>
							</div>
						</div>
					</div>
				</div>

				<div :class="$style.divider" />

				<div :class="$style.column">
					<div :class="$style.guides_block">
						<div :class="$style.label">GETTING STARTED</div>

						<div :class="$style.guide">
							<span>How to participate?</span>
							<span>Basic</span>
						</div>

						<div :class="$style.guide">
							<span>Liquidity & rewards</span>
							<span>Basic</span>
						</div>
					</div>

					<div :class="$style.guides_block">
						<div :class="$style.label">use cases</div>

						<div :class="$style.guide">
							<span>Betting: Symbols, Sports, etc</span>
							<span>Guide</span>
						</div>

						<div :class="$style.guide">
							<span>Binary Options Mode</span>
							<span>Guide</span>
						</div>

						<div :class="$style.guide">
							<span>Shared Liquidity Pool</span>
							<span>Guide</span>
						</div>
					</div>

					<div :class="$style.buttons">
						<div :class="$style.button_group">
							<Button size="mini" type="secondary" block>
								<Icon
									name="lock"
									size="14"
									style="fill: var(--green)"
								/>Security Audits
							</Button>

							<Button
								size="mini"
								type="secondary"
								block
								as-link
								link="https://discord.gg/FeGDCkHhnB"
							>
								<Icon
									name="document"
									size="14"
									style="fill: var(--text-primary)"
								/>White-Papper
							</Button>
						</div>
					</div>
				</div>
			</div>
			<div v-if="activeLink === 'Community'" :class="$style.card">
				<div :class="$style.column">
					<div :class="$style.atlas_block">
						<div :class="$style.label">Communicate</div>

						<router-link
							v-for="(link, i) in communityLinks"
							:key="i"
							:to="link.url"
							:class="$style.item"
						>
							<Icon :name="link.icon" size="20" />

							<div :class="$style.text">
								<span>{{ link.title }}</span>
								<span>{{ link.description }}</span>
							</div>
						</router-link>
					</div>
				</div>

				<div :class="$style.divider" />

				<div :class="$style.column">
					<div :class="$style.guides_block">
						<div :class="$style.label">GETTING STARTED</div>

						<div :class="$style.guide">
							<span>How to participate?</span>
							<span>Basic</span>
						</div>

						<div :class="$style.guide">
							<span>Liquidity & rewards</span>
							<span>Basic</span>
						</div>
					</div>

					<div :class="$style.guides_block">
						<div :class="$style.label">use cases</div>

						<div :class="$style.guide">
							<span>Betting: Symbols, Sports, etc</span>
							<span>Guide</span>
						</div>

						<div :class="$style.guide">
							<span>Binary Options Mode</span>
							<span>Guide</span>
						</div>

						<div :class="$style.guide">
							<span>Shared Liquidity Pool</span>
							<span>Guide</span>
						</div>
					</div>

					<div :class="$style.buttons">
						<Button size="mini" type="secondary" block>
							<Icon
								name="telegram"
								size="14"
								style="fill: var(--text-primary)"
							/>Telegram Channel: Notifications
						</Button>
					</div>
				</div>
			</div>
		</div>
	</transition>
</template>

<style module>
.wrapper {
	position: absolute;
	top: 50px;
	left: 0;
	right: 0;

	display: flex;
	justify-content: center;

	z-index: 1005;
}

.card {
	display: flex;

	min-width: 692px;
	height: fit-content;

	background: #262626;
	border-radius: 8px;

	padding: 24px 16px 20px 16px;
}

.content {
	display: flex;
}

.column {
	flex: 1;

	display: flex;
	flex-direction: column;
	justify-content: space-between;
}

.divider {
	width: 1px;

	margin: 0 24px 0 50px;

	background: var(--border);
}

.label {
	font-size: 11px;
	line-height: 1;
	font-weight: 700;
	color: var(--text-tertiary);

	text-transform: uppercase;

	padding: 0 8px;
}

.items {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.item {
	display: flex;
	align-items: center;
	gap: 16px;

	border-radius: 8px;
	padding: 8px;
	cursor: pointer;

	transition: background 0.4s ease;
}

.item.disabled {
	pointer-events: none;
	opacity: 0.5;
}

.item:hover .text span:nth-child(2) {
	color: var(--text-secondary);
}

.icon_wrapper {
	display: flex;
	background: rgba(255, 255, 255, 0.05);
	fill: var(--text-primary);

	border-radius: 10px;
	padding: 13px;

	box-sizing: content-box;
}

.icon_wrapper svg {
	transition: all 0.2s ease;
}

.text {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.text span:nth-child(1) {
	font-size: 14px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-primary);
}

.text span:nth-child(2) {
	font-size: 12px;
	line-height: 1;
	font-weight: 500;
	color: var(--text-tertiary);

	transition: color 0.2s ease;
}

.atlas_block .label {
	margin-bottom: 16px;
}

.guides_block {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.advanced_block .label {
	margin-bottom: 16px;
}

.guide {
	display: flex;
	align-items: center;
	justify-content: space-between;
	cursor: pointer;

	padding: 0 8px;
}

.guide span:nth-child(1) {
	font-size: 13px;
	line-height: 1.1;
	font-weight: 500;
	color: var(--text-primary);
}

.guide span:nth-child(2) {
	font-size: 12px;
	line-height: 1;
	font-weight: 500;
	color: var(--text-tertiary);
}

.buttons {
	display: flex;
	flex-direction: column;
	gap: 8px;

	padding: 0 8px;
}

.button_group {
	display: flex;
	gap: 8px;
}
</style>