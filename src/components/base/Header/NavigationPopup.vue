<script setup>
import { ref, watch, nextTick } from "vue"

/**
 * UI
 */
import Button from "@ui/Button.vue"

const props = defineProps({
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
		icon: "flag_1",
		title: "Events",
		description: "All events with advanced filters",
		url: "/events",
	},
	{
		icon: "wallet_1",
		title: "Markets",
		description: "Available symbols for betting",
		url: "/markets",
	},
	{
		icon: "rank_crown",
		title: "Ranking",
		description: "Compete with other users",
		url: "/rank",
		disabled: true,
	},
])

const resourcesLinks = ref([
	{
		icon: "compass_1",
		title: "Documentation",
		description: "Everything you need is here",
		url: "/docs",
	},
	{
		icon: "code_circle",
		title: "Developers",
		description: "Learn the product in more detail",
		url: "/docs",
		disabled: true,
	},
	{
		icon: "map",
		title: "Roadmap",
		description: "Explore the product path",
		url: "/docs/roadmap",
	},
	{
		icon: "github",
		title: "Source Code",
		description: "Explore our code & Contribute",
		url: "https://github.com/juster-finance",
	},
])

const communityLinks = ref([
	{
		icon: "feather",
		title: "Blog",
		description: "Guides & articles from the team",
		url: "/blog",
	},
	{
		icon: "asterisk",
		title: "Releases",
		description: "Detailed list of all changes",
		url: "/releases",
	},
	{
		icon: "telegram",
		title: "Telegram",
		description: "Communication and discussion",
		url: "https://t.me/juster_io",
	},
	{
		icon: "twitter",
		title: "Twitter",
		description: "Latest news and updates",
		url: "https://x.com/juster_io",
	},
])

const posX = ref(0)
const carretRef = ref(null)
watch(
	() => props.activeLink,
	() => {
		if (!props.activeLink) return

		const navEl = document.getElementById(props.activeLink)
		const navElRect = navEl.getBoundingClientRect()

		nextTick(() => {
			posX.value = navElRect.left + navElRect.width / 2 - navEl.parentElement.getBoundingClientRect().left
		})
	},
)
</script>

<template>
	<transition name="navpopup">
		<div v-if="activeLink.length" @click="emit('onClick')" :class="[$style.wrapper, activeLink.length && $style.animate]">
			<div :class="$style.carret">
				<svg
					ref="carretRef"
					width="16"
					height="8"
					viewBox="0 0 16 8"
					xmlns="http://www.w3.org/2000/svg"
					:style="{ transform: `translateX(${posX}px)` }"
				>
					<path d="M8 0L16 8H0L8 0Z" />
				</svg>
			</div>

			<Flex
				v-if="activeLink.length"
				direction="column"
				gap="16"
				:class="[
					$style.card,
					activeLink === 'Browse' && $style.left,
					activeLink === 'Resources' && $style.center,
					activeLink === 'Community' && $style.right,
				]"
			>
				<template v-if="activeLink === 'Browse'">
					<Flex :class="$style.base">
						<Flex direction="column" gap="24" :class="$style.column">
							<div :class="$style.atlas_block">
								<component
									v-for="(link, i) in browseLinks"
									:is="link.url.startsWith('https://') ? 'a' : 'router-link'"
									:key="i"
									:to="link.url"
									:href="link.url"
									:target="link.url.startsWith('https://') && _blank"
									:class="[$style.item, link.disabled && $style.disabled]"
								>
									<div :class="$style.icon_wrapper">
										<Icon :name="link.icon" size="20" />
									</div>

									<div :class="$style.text">
										<span>{{ link.title }}</span>
										<span>{{ link.description }}</span>
									</div>
								</component>
							</div>
						</Flex>

						<div :class="$style.divider" />

						<Flex direction="column" gap="16" :class="$style.column">
							<div :class="$style.advanced_block">
								<!-- TODO: #3 -->
								<router-link to="/pools" :class="[$style.item, $style.disabled]">
									<div :class="$style.icon_wrapper">
										<Icon name="server" size="20" />
									</div>

									<div :class="$style.text">
										<span>Liquidity Pools</span>
										<span>Provide liquidity to events</span>
									</div>
								</router-link>
							</div>

							<Flex direction="column" gap="16" :class="$style.guides_block">
								<Text size="11" weight="700" color="support">FEATURED GUIDES</Text>

								<router-link to="/blog/liquidity-pools-introduction">
									<Flex direction="column" gap="8">
										<Text size="13" weight="500" color="secondary">What you need to know to use Pools</Text>
										<Text size="12" weight="600" color="tertiary">Advanced</Text>
									</Flex>
								</router-link>
							</Flex>
						</Flex>
					</Flex>

					<Flex align="center" justify="between" :class="$style.bottom">
						<!-- TODO: #3 -->
						<!-- <router-link to="/releases">
							<Button size="small" type="secondary" block>
								<Icon name="asterisk" size="16" style="fill: var(--green)" />What's New in 1.1
							</Button>
						</router-link> -->

						<Flex gap="8">
							<!-- TODO: #3 -->
							<!-- <Button size="small" type="tertiary" link="https://status.juster.fi">
								<Icon name="bolt" size="16" color="tertiary" />System Status
							</Button> -->

							<Button size="small" type="tertiary" link="https://t.me/juster_io">
								<Icon name="help" size="16" color="tertiary" />Support
							</Button>
						</Flex>
					</Flex>
				</template>

				<template v-if="activeLink === 'Resources'">
					<Flex :class="$style.base">
						<Flex direction="column" gap="24" :class="$style.column">
							<div :class="$style.atlas_block">
								<component
									:is="link.url.startsWith('https://') ? 'a' : 'router-link'"
									v-for="(link, i) in resourcesLinks"
									:key="i"
									:to="link.url"
									:href="link.url"
									:target="link.url.startsWith('https://') && '_blank'"
									:class="[$style.item, link.disabled && $style.disabled]"
								>
									<div :class="$style.icon_wrapper">
										<Icon :name="link.icon" size="20" />
									</div>

									<div :class="$style.text">
										<span>{{ link.title }}</span>
										<span>{{ link.description }}</span>
									</div>
								</component>
							</div>
						</Flex>

						<div :class="$style.divider" />

						<Flex direction="column" gap="24" :class="$style.column">
							<Flex direction="column" gap="16" :class="$style.guides_block">
								<Text size="11" weight="700" color="support">GETTING STARTED</Text>

								<router-link to="/docs/events-how-to-stake">
									<Flex direction="column" gap="8">
										<Text size="13" weight="500" color="secondary">How to Stake</Text>
										<Text size="12" weight="600" color="tertiary">Basic</Text>
									</Flex>
								</router-link>
								<router-link to="/docs/events-providing-liquidity">
									<Flex direction="column" gap="8">
										<Text size="13" weight="500" color="secondary">Providing Liquidity</Text>
										<Text size="12" weight="600" color="tertiary">Advanced</Text>
									</Flex>
								</router-link>
								<router-link to="/docs/how-to-get-tezos">
									<Flex direction="column" gap="8">
										<Text size="13" weight="500" color="secondary">How to get Tezos</Text>
										<Text size="12" weight="600" color="tertiary">Basic</Text>
									</Flex>
								</router-link>
							</Flex>
						</Flex>
					</Flex>

					<!-- <Flex align="center" justify="between" :class="$style.bottom">
						<Button size="small" type="secondary"> <Icon name="shield_tick" size="14" color="green" />Security Audits </Button>

						<Button size="small" type="tertiary" link="https://t.me/juster_io">
							<Icon name="document" size="14" color="primary" />White-Paper
						</Button>
					</Flex> -->
					<Flex align="center" justify="between" :class="$style.bottom">
						<!-- TODO: #3 -->
						<!-- <router-link to="/releases">
							<Button size="small" type="secondary" block>
								<Icon name="asterisk" size="16" style="fill: var(--green)" />What's New in 1.1
							</Button>
						</router-link> -->

						<Flex gap="8">
							<!-- TODO: #3 -->
							<!-- <Button size="small" type="tertiary" link="https://status.juster.fi">
								<Icon name="bolt" size="16" color="tertiary" />System Status
							</Button> -->

							<Button size="small" type="tertiary" link="https://t.me/juster_io">
								<Icon name="help" size="16" color="tertiary" />Support
							</Button>
						</Flex>
					</Flex>
				</template>

				<template v-if="activeLink === 'Community'">
					<Flex :class="$style.base">
						<Flex direction="column" gap="24" :class="$style.column">
							<div :class="$style.atlas_block">
								<component
									:is="link.url.startsWith('https://') ? 'a' : 'router-link'"
									v-for="(link, i) in communityLinks"
									:key="i"
									:to="link.url"
									:href="link.url"
									:target="link.url.startsWith('https://') && '_blank'"
									:class="$style.item"
								>
									<div :class="$style.icon_wrapper">
										<Icon :name="link.icon" size="20" />
									</div>

									<div :class="$style.text">
										<span>{{ link.title }}</span>
										<span>{{ link.description }}</span>
									</div>
								</component>
							</div>
						</Flex>

						<div :class="$style.divider" />

						<Flex direction="column" gap="24" :class="$style.column">
							<Flex direction="column" gap="16" :class="$style.guides_block">
								<Text size="11" weight="700" color="support">EXTRA TOPICS</Text>

								<router-link to="/docs/concepts">
									<Flex direction="column" gap="8">
										<Text size="13" weight="500" color="secondary">Learn the Concepts</Text>
										<Text size="12" weight="600" color="tertiary">Basic</Text>
									</Flex>
								</router-link>
								<router-link to="/docs/markets-symbols">
									<Flex direction="column" gap="8">
										<Text size="13" weight="500" color="secondary">Available Markets</Text>
										<Text size="12" weight="600" color="tertiary">Basic</Text>
									</Flex>
								</router-link>
								<router-link to="/docs/faq">
									<Flex direction="column" gap="8">
										<Text size="13" weight="500" color="secondary">FAQ</Text>
										<Text size="12" weight="600" color="tertiary">Basic</Text>
									</Flex>
								</router-link>
								<router-link to="/docs/fees">
									<Flex direction="column" gap="8">
										<Text size="13" weight="500" color="secondary">About Fees</Text>
										<Text size="12" weight="600" color="tertiary">Basic</Text>
									</Flex>
								</router-link>
							</Flex>
						</Flex>
					</Flex>

					<!-- <Flex align="center" justify="between" :class="$style.bottom">
						<Button size="small" type="secondary"> <Icon name="telegram" size="14" color="primary" />Telegram Channel </Button>

						<Button size="small" type="tertiary"> <Icon name="help" size="14" color="tertiary" />About </Button>
					</Flex> -->
					<Flex align="center" justify="between" :class="$style.bottom">
						<!-- TODO: #3 -->
						<!-- <router-link to="/releases">
							<Button size="small" type="secondary" block>
								<Icon name="asterisk" size="16" style="fill: var(--green)" />What's New in 1.1
							</Button>
						</router-link> -->

						<Flex gap="8">
							<!-- TODO: #3 -->
							<!-- <Button size="small" type="tertiary" link="https://status.juster.fi">
								<Icon name="bolt" size="16" color="tertiary" />System Status
							</Button> -->

							<Button size="small" type="tertiary" link="https://t.me/juster_io">
								<Icon name="help" size="16" color="tertiary" />Support
							</Button>
						</Flex>
					</Flex>
				</template>
			</Flex>
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

.carret svg {
	position: absolute;
	top: -8px;
	left: 0;

	fill: var(--card-bg);

	transition: transform 0.2s ease;
}

.card {
	min-width: 692px;
	height: fit-content;

	background: var(--card-bg);
	border-radius: 8px;
	overflow: hidden;

	box-shadow: rgb(0 0 0 / 30%) 0px 20px 40px;

	transition: transform 0.2s ease;
}

.card.left {
	transform: translateX(-20px);
}

.card.center {
	transform: translateX(0);
}

.card.right {
	transform: translateX(20px);
}

.base {
	padding: 16px 16px 0 16px;
}

.bottom {
	height: 66px;

	background: rgba(0, 0, 0, 0.1);
	border-top: 1px solid var(--border);

	padding: 0 24px;
}

.column {
	flex: 1;
}

.divider {
	width: 1px;

	margin: 0 24px 0 32px;

	background: var(--border);
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

.item:hover .icon_wrapper {
	fill: var(--brand);
}

.icon_wrapper {
	display: flex;

	background: linear-gradient(rgb(40, 40, 43), rgb(50, 50, 53)) padding-box,
		linear-gradient(to bottom, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0)) border-box;
	border-radius: 10px;
	border: 1px solid transparent;

	fill: var(--text-primary);

	padding: 12px;

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
	padding: 8px;
}

.advanced_block .label {
	margin-bottom: 16px;
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
