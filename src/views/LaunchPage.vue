<script setup>
/**
 * Base
 */
import Page from "@/components/base/Page"

/**
 * UI
 */
import Button from "@/components/ui/Button"
import Banner from "@/components/ui/Banner"

/**
 * Services
 */
import { juster, switchNetwork } from "@/services/sdk"

const handleSwitch = () => {
	juster.sdk._provider.client.clearActiveAccount().then(async () => {
		switchNetwork("mainnet")
	})
}
</script>

<template>
	<Page :class="$style.wrapper">
		<img
			src="@/assets/landing/ga_bg.png"
			alt="bg"
			:class="$style.background_grad"
		/>

		<div :class="$style.header">
			<Icon name="logo_symbol" size="40" />

			<h1>Juster is now available on the Mainnet</h1>

			<div :class="$style.when">17 February 2022</div>
		</div>

		<div :class="$style.content">
			<p>
				After several months of extensive development, we are happy to
				announce that <b>Juster</b> is up and running on the
				<b>Mainnet</b>! Juster is a decentralized betting protocol on
				the Tezos blockchain allowing to bet on crypto price dynamics or
				to become a bookmaker. The current stable version of the web
				application is <b>1.0</b>.
			</p>

			<div
				v-if="juster.sdk._network == 'ithacanet'"
				:class="$style.interactive_block"
			>
				<Banner type="warning" color="yellow" size="small" center
					>You're currently on a testnet ({{
						juster.sdk._network.slice(0, 1).toUpperCase() +
						juster.sdk._network.slice(
							1,
							juster.sdk._network.length,
						)
					}})</Banner
				>

				<Button
					@click="handleSwitch"
					type="secondary"
					size="medium"
					block
					:class="$style.switch_btn"
					><Icon name="network" size="16" />Switch to Mainnet</Button
				>

				<div :class="$style.hint">
					You can always change the current network in the footer
				</div>
			</div>
			<div v-else :class="$style.interactive_block">
				<Banner icon="checkcircle" color="green" size="small" center
					>You are on the main network!</Banner
				>

				<router-link to="/">
					<Button type="secondary" size="medium" block
						><Icon name="bolt" size="16" />Explore the
						Juster</Button
					>
				</router-link>

				<div :class="$style.hint">
					You can always change the current network in the Footer
				</div>
			</div>

			<p>
				<b
					>All the business logic is implemented in the smart contract
					on Tezos:</b
				>
				you can place bets, add liquidity, and withdraw profits even if
				Juster services are down. If anything goes wrong during the
				event execution — it will be canceled and your funds will be
				returned to your wallet.
				<i
					>Still please acknowledge the risks you take when using
					Juster as any other DeFi application.</i
				>
			</p>

			<p>
				Our next moves after the launch is to get more feedback to
				adjust the product and make the UX even smoother. The upcoming
				epic features include a liquidity pool contract, reward
				programs, and many other interesting things. Check out our
				roadmap and join
				<a href="https://discord.gg/FeGDCkHhnB" target="_blank"
					>Juster Discord server</a
				>
				to get the latest updates!
			</p>

			<p>
				<b>Many thanks ♥</b> to the early testing participants who
				helped us find critical bugs in the product, which were promptly
				fixed. We also haven't forgotten about the contest winners, keep
				an eye on the announcements channel for further instructions.
			</p>

			<p><i>-- Juster Team</i></p>
		</div>

		<div :class="$style.buttons">
			<a href="https://discord.gg/FeGDCkHhnB" target="_blank">
				<Button type="secondary" size="small"
					><Icon name="discord" size="16" />Join our Discord
				</Button></a
			>
			<a href="https://twitter.com/Juster_fi" target="_blank">
				<Button type="secondary" size="small"
					><Icon name="twitter" size="16" />Read our Twitter</Button
				>
			</a>
		</div>
	</Page>
</template>

<style module>
.wrapper {
	margin: 0 auto;
	padding: 0 40px;

	display: flex;
	flex-direction: column;
	align-items: center;
}

.background_grad {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	z-index: -1;
	opacity: 0.6;

	width: 100%;
}

.header {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.header h1 {
	font-size: 32px;
	line-height: 1.25;
	font-weight: 600;
	text-align: center;

	max-width: 385px;

	margin-bottom: 16px;
}

.header svg {
	fill: var(--text-primary);

	margin: 70px 0 40px 0;
}

.when {
	font-size: 16px;
	line-height: 1;
	font-weight: 500;
	color: var(--text-tertiary);
}

.content {
	display: flex;
	flex-direction: column;
	gap: 24px;

	max-width: 600px;

	margin-top: 44px;
}

.content p {
	font-size: 16px;
	line-height: 1.6;
	font-weight: 400;
	color: var(--text-secondary);
}

.content p a {
	color: var(--text-blue);
}

.buttons {
	display: flex;
	align-items: center;
	gap: 8px;

	margin-top: 40px;
	margin-bottom: 200px;
}

.interactive_block {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.hint {
	font-size: 13px;
	line-height: 1.6;
	font-weight: 500;
	color: var(--text-tertiary);
	text-align: center;

	max-width: 400px;

	margin: 8px auto 20px auto;
}

.switch_btn svg {
	fill: var(--blue);
}

@media (max-width: 450px) {
	.wrapper {
		padding: 0 20px;
	}
}
</style>
