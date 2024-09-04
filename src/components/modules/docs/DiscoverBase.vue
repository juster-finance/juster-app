<script setup>
import { reactive } from "vue"

/**
 * Modules: Docs
 */
import HeaderAnchor from "./HeaderAnchor.vue"
import TableOfContents from "./TableOfContents.vue"

/**
 * UI
 */
import Button from "@ui/Button.vue"
import Banner from "@ui/Banner.vue"

const cards = reactive([
	{
		name: "First Stake",
		description:
			"Learn the basic principles of placing a bet and choosing the right event",
		image: "firstsubmission.png",
	},
	{
		name: "Providing Liquidity",
		description:
			"Learn the basic principles of placing a bet and choosing the right event",
		image: "providingliquidity.png",
	},
])

const getImageUrl = (image) => {
	return new URL(`../../../assets/docs/${image}`, import.meta.url).href
}
</script>

<template>
	<div :class="$style.wrapper">
		<div :class="$style.article">
			<HeaderAnchor h="1">Juster Documentation</HeaderAnchor>

			<p>
				This documentation will help you understand how our platform is
				set up, how to place bets, and how to provide liquidity. If you
				have questions or suggestions, join our discord server.
			</p>

			<div :class="$style.cards">
				<div
					v-for="(card, index) in cards"
					:key="index"
					:class="$style.card"
				>
					<div
						v-if="card.image"
						:class="$style.cover"
						:style="{
							backgroundImage: `linear-gradient(rgba(21, 21, 21, 0) 0%, rgba(21, 21, 21, 1) 120%), url(${getImageUrl(
								card.image,
							)})`,
						}"
					/>
					<span>{{ card.name }}</span>
					<span>
						{{ card.description }}
					</span>
				</div>
			</div>

			<div :class="$style.block">
				<HeaderAnchor h="2">Why Juster?</HeaderAnchor>

				<p>
					Juster is an on-chain smart contract platform allowing users
					to take part in an automated betting market by creating
					events, providing liquidity to them, and making bets.
				</p>

				<div :class="$style.benefits">
					<div :class="$style.benefit">
						<Icon name="verified" size="20" /> Automated betting
						market by creating events, providing liquidity to them.
						No need to worry about lack of liquidity
					</div>
					<div :class="$style.benefit">
						<Icon name="verified" size="20" /> Juster is powered by
						Tezos, which enables payouts to run as an automated
						process that no person or organisation, including
						Juster, can interfere with
					</div>
					<div :class="$style.benefit">
						<Icon name="verified" size="20" /> Juster is a
						peer-to-peer, decentralized exchange, enabling universal
						and transparent access to its markets
					</div>
					<div :class="$style.benefit">
						<Icon name="verified" size="20" /> Users keep more of
						their winnings than any other exchange through low fees
						and the best odds. Juster doesn’t take a cut.
					</div>
				</div>

				<p>
					Our main goal is to provide the most transparent betting
					system for everyone. At the initial stage, we will give you
					the opportunity to bet on price changes of different
					currency pairs (BTC-USD, ETH-USD & TON-USD).
				</p>
			</div>

			<div :class="$style.block">
				<HeaderAnchor h="2">Mainnet Launch</HeaderAnchor>

				<p>
					In mid-February, we finished beta testing and officially
					launched Juster on the main network. We continue to actively
					fix bugs, improve the interface and provide you with new
					betting / liquidity options.
				</p>

				<div :class="$style.buttons">
					<router-link to="/launch">
						<Button type="secondary" size="medium">
							<Icon name="spark" size="16" />Visit Launch Page
						</Button>
					</router-link>
					<a
						href="https://github.com/juster-finance/juster-app/releases/tag/v1.0.0"
						target="_blank"
					>
						<Button type="secondary" size="medium">
							<Icon name="document" size="16" />Release 1.0
						</Button>
					</a>
				</div>
			</div>

			<div :class="$style.block">
				<HeaderAnchor h="2">Community</HeaderAnchor>

				<p>
					Join our community (Discord, Twitter, GitHub). Communicate
					with other users, analyze the market, make joint bets.
					Working together can improve your results. Also, we
					regularly publish release notes.
				</p>
			</div>

			<Banner icon="help" color="gray" size="medium"
				>Please note that this application is in the active development
				phase. Minor bugs are possible.</Banner
			>
		</div>

		<TableOfContents />
	</div>
</template>

<style module>
.wrapper {
	display: flex;

	position: relative;
}

.wrapper h1 {
	margin-bottom: 24px;
}

.wrapper p {
	font-size: 16px;
	line-height: 1.6;
	font-weight: 400;
	color: var(--text-secondary);
}

.article {
	min-width: 700px;
}

.block {
	display: flex;
	flex-direction: column;
	gap: 20px;

	margin-bottom: 60px;
}

.cards {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(330px, 1fr));
	grid-gap: 40px;

	margin: 40px 0 60px 0;
}

.card {
	display: flex;
	flex-direction: column;

	border-radius: 10px;
	background: #151515;
	cursor: pointer;
	perspective: 2000px;

	padding: 32px 32px 24px 32px;
}

.card * {
	transition: transform 400ms ease;
}

.card:hover .cover {
	transform: translateY(16px) scale(1.01) rotateX(25deg);
}

.card:hover span {
	transform: translateY(-5px);
}

.cover {
	width: 266px;
	height: 168px;

	background-size: contain;
	transform-origin: 50% -50%;

	margin-bottom: 28px;
}

.card span:nth-of-type(1) {
	font-size: 16px;
	line-height: 1;
	font-weight: 600;
	color: var(--text-primary);

	margin-bottom: 10px;
}

.card span:nth-of-type(2) {
	font-size: 14px;
	line-height: 1.6;
	font-weight: 500;
	color: var(--text-tertiary);

	max-width: 250px;
}

.buttons {
	display: flex;
	align-items: center;
	gap: 16px;
}

.benefits {
	display: flex;
	flex-direction: column;
	gap: 24px;

	margin: 16px 0;
}

.benefit {
	display: flex;
	gap: 12px;

	font-size: 16px;
	line-height: 1.7;
	font-weight: 500;
	color: var(--text-secondary);

	fill: var(--green);
}

.benefit svg {
	margin-top: 3px;
}
</style>
