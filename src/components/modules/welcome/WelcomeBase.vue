<script setup>
/**
 * Vendor
 */
import { ref, reactive, onMounted, computed, watch } from "vue"
import { useRouter } from "vue-router"
import { useIsConnectionRestored } from '@townsquarelabs/ui-vue';

/**
 * UI
 */
import Button from "@ui/Button.vue"
import Selector from "@ui/Selector.vue"

/**
 * Local
 */
import { EventCard, EventCardLoading } from "@local/EventCard"

/**
 * API
 */
import { fetchEventsByStatus } from "@api/events"

/**
 * Store
 */
import { useAccountStore } from "@store/account"

/**
 * Services
 */
import { currentNetwork } from "@sdk"
import { token, localStorageKeys } from "@config"
import { toUserFriendlyAddress } from "@utils/address"

const accountStore = useAccountStore()
const isConnectionRestored = useIsConnectionRestored()
const userFriendlyAddress = computed(() => toUserFriendlyAddress(accountStore.pkh))

const router = useRouter()

const steps = ref([
	{
		name: "Start",
		icon: {
			name: "logo_symbol",
			size: 26,
		},
	},
	{
		name: "DeFi",
		icon: {
			name: "hex",
			size: 32,
		},
	},
	{
		name: "Price Events",
		icon: {
			name: "line_chart_up_circle",
			size: 32,
		},
	},
	{
		name: "Stakes",
		icon: {
			name: "chart_breakout_circle",
			size: 32,
		},
	},
	{
		name: "Done",
		icon: {
			name: "check_circle_broken",
			size: 32,
		},
	},
])
const activeStepIndex = ref(0)

const event = ref({})

const selectedTheme = ref("Dark")

const currencyItems = reactive([
	{
		name: token.name,
		hint: "Default",
	},
	{
		name: "U.S. Dollar",
	},
	{
		name: "Euro",
	},
])
const selectedCurrencyItem = ref(currencyItems[0].name)

const isViewed = localStorage.getItem(localStorageKeys.IS_ONBOARDING_SHOWN)

watch(isConnectionRestored, (isConnectionRestored) => {
	if (isConnectionRestored && !accountStore.pkh) {
		router.push("/Explore")
	}
})

onMounted(async () => {
	event.value = (await fetchEventsByStatus({ status: "NEW" }))[0]
})

const getCirclePos = (index) => {
	if (activeStepIndex.value === 5) {
		return {
			left: 50 + 30 + 20 * (index - activeStepIndex.value),
			top: 40,
		}
	} else {
		return {
			left: 50 + 20 * (index - activeStepIndex.value),
			top: 50,
		}
	}
}

const handleStart = () => {
	// localStorage.setItem(localStorageKeys.IS_ONBOARDING_SHOWN, true)

	activeStepIndex.value = 1
}

const handleEnd = () => {
	localStorage.setItem(localStorageKeys.IS_ONBOARDING_SHOWN, true)

	router.push("/?welcome=1")
}
</script>

<template>
	<Flex v-if="!!accountStore.pkh" direction="column" align="center" justfy="between">
		<Flex direction="column" align="center" wide :class="$style.wrapper">
			<Flex align="center" gap="8" :class="$style.slider">
				<!-- Start -->
				<div
					v-for="(step, index) in steps"
					:key="step.name"
					@click="activeStepIndex = index"
					:style="{
						left: `${getCirclePos(index).left}%`,
						top: `${getCirclePos(index).top}%`,
					}"
					:class="[
						$style.circle_wrapper,
						index === activeStepIndex && $style.current,
					]"
				>
					<Flex
						align="center"
						justify="center"
						:style="{
							opacity:
								1 -
								(Math.abs(index - activeStepIndex) * 3) / 10,
						}"
						:class="$style.circle"
					>
						<Icon
							:name="step.icon.name"
							:size="step.icon.size"
							color="primary"
						/>
					</Flex>
				</div>

				<div
					v-if="activeStepIndex == 5"
					:class="[$style.circle_wrapper, $style.current]"
					:style="{
						left: `50%`,
						top: `70%`,
					}"
				>
					<Flex
						align="center"
						justify="center"
						:style="{
							opacity:
								1 -
								(Math.abs(index - activeStepIndex) * 3) / 10,
							boxShadow: `0px 0px 32px rgba(239, 132, 86, 0.5)`,
						}"
						:class="$style.circle"
					>
						<Icon
							name="zap_circle"
							size="32"
							color="orange"
							style=""
						/>

						<svg
							width="252"
							height="55"
							viewBox="0 0 252 55"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							:class="[$style.lines_icon]"
						>
							<path
								d="M1 0V22C1 39.6731 15.3269 54 33 54H88"
								stroke="url(#paint0_linear_3237_53065)"
								stroke-opacity="0.2"
								stroke-width="2"
							/>
							<path
								d="M251 0V22C251 39.6731 236.673 54 219 54H164"
								stroke="url(#paint1_linear_3237_53065)"
								stroke-opacity="0.2"
								stroke-width="2"
							/>
							<defs>
								<linearGradient
									id="paint0_linear_3237_53065"
									x1="88"
									y1="54"
									x2="10.1819"
									y2="-10.9937"
									gradientUnits="userSpaceOnUse"
								>
									<stop stop-color="white" />
									<stop
										offset="1"
										stop-color="white"
										stop-opacity="0"
									/>
								</linearGradient>
								<linearGradient
									id="paint1_linear_3237_53065"
									x1="164"
									y1="54"
									x2="241.818"
									y2="-10.9937"
									gradientUnits="userSpaceOnUse"
								>
									<stop stop-color="white" />
									<stop
										offset="1"
										stop-color="white"
										stop-opacity="0"
									/>
								</linearGradient>
							</defs>
						</svg>
					</Flex>
				</div>

				<div
					:class="$style.line"
					:style="{
						marginTop: activeStepIndex === 5 ? '-60px' : '',
					}"
				/>
			</Flex>

			<!-- 
                Steps
             -->

			<transition name="slide" mode="out-in">
				<!-- Start Step -->
				<Flex
					v-if="activeStepIndex === 0"
					direction="column"
					gap="32"
					align="center"
					:class="[$style.base]"
					style="max-width: 370px"
				>
					<Flex direction="column" gap="16" align="center">
						<Text
							size="24"
							weight="600"
							color="primary"
							:class="$style.title"
						>
							Welcome to Juster Finance
						</Text>

						<Text
							size="16"
							weight="500"
							color="tertiary"
							height="16"
							align="center"
							:class="$style.description"
						>
							Now we'll help you dive into the application. Check
							that the correct account is selected.
						</Text>

						<Flex align="center" gap="32" :class="$style.sa_badge">
							<Flex align="center" gap="8">
								<img
									:src="`https://services.tzkt.io/v1/avatars/${accountStore.pkh}`"
									alt="avatar"
								/>

								<Flex direction="column" gap="8">
									<Text
										size="14"
										weight="600"
										color="primary"
									>
										{{ userFriendlyAddress.slice(0, 8) }}...{{
											userFriendlyAddress.slice(
												userFriendlyAddress.length - 8,
												userFriendlyAddress.length,
											)
										}}
									</Text>
									<Flex align="center">
										<Text
											size="14"
											weight="600"
											color="tertiary"
										>
											Balance&nbsp;
										</Text>
										<Text
											size="14"
											weight="600"
											color="secondary"
										>
											{{ accountStore.balance }}
										</Text>
									</Flex>
								</Flex>
							</Flex>

							<a
								:href="`https://${
									currentNetwork === 'mainnet'
										? ''
										: 'ghostnet.'
								}tzkt.io/${accountStore.pkh}`"
								target="_blank"
							>
								<Icon
									name="explorer"
									size="16"
									color="tertiary"
									:class="$style.sa_badge__btn"
								/>
							</a>
						</Flex>
					</Flex>

					<Flex direction="column" gap="60" align="center">
						<Button @click="handleStart" type="white" size="small">
							Let's get started
							<Icon name="login" size="16" color="black" />
						</Button>

						<Flex
							v-if="isViewed"
							direction="column"
							gap="8"
							align="center"
						>
							<Icon name="warning" size="16" color="orange" />
							<Text
								size="13"
								weight="600"
								color="tertiary"
								align="center"
								height="16"
							>
								You've already been through onboarding
							</Text>
							<Button
								@click="handleEnd"
								type="tertiary"
								size="small"
							>
								Close it
								<Icon name="login" size="16" color="black" />
							</Button>
						</Flex>
					</Flex>
				</Flex>

				<!-- DeFi Step -->
				<Flex
					v-else-if="activeStepIndex === 1"
					direction="column"
					gap="32"
					align="center"
					:class="$style.base"
					style="max-width: 550px"
				>
					<Flex direction="column" gap="16" align="center">
						<Text
							size="24"
							weight="600"
							color="primary"
							align="center"
							:class="$style.title"
						>
							Decentralized Financial Instrument
						</Text>
						<Text
							size="16"
							weight="500"
							color="tertiary"
							height="16"
							align="center"
							:class="$style.description"
						>
							Juster is an on-chain smart contract platform
							allowing users to take part in an automated betting
							market by creating events, providing liquidity to
							them, and making bets.
						</Text>
					</Flex>

					<Button
						@click="activeStepIndex = 2"
						type="white"
						size="small"
					>
						How does it really work?
						<Icon name="login" size="16" color="black" />
					</Button>
				</Flex>

				<!-- Events Step -->
				<Flex
					v-else-if="activeStepIndex === 2"
					wide
					justify="between"
					align="center"
					:class="$style.events_step"
				>
					<Flex
						direction="column"
						gap="40"
						align="start"
						:class="$style.base"
						style="max-width: 500px"
					>
						<Flex direction="column" gap="20">
							<Text
								size="24"
								weight="600"
								color="primary"
								:class="$style.title"
							>
								Price Event
							</Text>
							<Text
								size="16"
								weight="500"
								color="tertiary"
								height="16"
								:class="$style.description"
							>
								On the right side you can see the event card. It
								is still accepting stakes from those wishing to
								participate and liquidity deposits.
							</Text>

							<Flex direction="column" gap="16">
								<Flex align="center" gap="6">
									<Icon
										name="time"
										size="16"
										color="tertiary"
									/>
									<Text
										size="14"
										weight="600"
										color="tertiary"
										height="16"
									>
										<!--TODO: #3 -->
										<!-- The duration of the event varies, from 6
										hours to 7 days -->
										The duration of the event varies, from 5
										minutes to 7 days
									</Text>
								</Flex>
								<Flex align="center" gap="6">
									<Icon
										name="flag"
										size="16"
										color="tertiary"
									/>
									<Text
										size="14"
										weight="600"
										color="tertiary"
										height="16"
									>
										The time of acceptance of stakes and
										deposits is limited
									</Text>
								</Flex>
							</Flex>
						</Flex>

						<Button
							@click="activeStepIndex = 3"
							type="white"
							size="small"
						>
							Time to place a stake
							<Icon name="login" size="16" color="black" />
						</Button>
					</Flex>

					<EventCard v-if="!!event"
						:event="event"
						disableSub
						:class="$style.event_card"
					/>
					<EventCardLoading v-else :class="$style.event_card" />
				</Flex>

				<!-- Stakes Step -->
				<Flex
					v-else-if="activeStepIndex === 3"
					justify="between"
					direction="rowReversed"
					gap="60"
					wide
					align="center"
					:class="$style.stake_step"
				>
					<Flex
						direction="column"
						gap="40"
						:class="$style.base"
						style="max-width: 500px"
					>
						<Flex direction="column" gap="20">
							<Text
								size="24"
								weight="600"
								color="primary"
								:class="$style.title"
							>
								Placing Stakes
							</Text>
							<Text
								size="16"
								weight="500"
								color="tertiary"
								height="16"
								:class="$style.description"
							>
								First, select a currency pair. Next, choose a
								time interval. Then, select the anticipated
								price direction during the selected interval. If
								your prediction is correct, you will receive a
								payout
							</Text>

							<Flex align="center" gap="6">
								<Icon name="money" size="16" color="tertiary" />
								<Text
									size="14"
									weight="600"
									color="tertiary"
									height="16"
								>
									Payout may vary depending on the demand of
									the chosen side
								</Text>
							</Flex>
						</Flex>

						<Flex direction="column" gap="24" align="start">
							<Button
								@click="activeStepIndex = 4"
								type="white"
								size="small"
							>
								Last step and you're ready
								<Icon name="login" size="16" color="black" />
							</Button>
							<!-- TODO: #3 -->
							<!--<Flex>
								<Text size="12" weight="500" color="tertiary"
									>I want to</Text
								>
								<Text
									@click="activeStepIndex = 5"
									size="12"
									weight="500"
									color="blue"
									>&nbsp;provide liquidity&nbsp;</Text
								>
								<Text size="12" weight="500" color="tertiary">
									and use liquidity pools</Text
								>
							</Flex>-->
						</Flex>
					</Flex>

					<img
						src="@/assets/onboarding/event_chart.png"
						alt="event_chart"
						:class="$style.event_chart_img"
					/>
				</Flex>

				<!-- Liquidity Step -->
				<Flex
					v-else-if="activeStepIndex === 5"
					direction="column"
					gap="32"
					align="center"
					:class="$style.base"
					style="max-width: 370px"
				>
					<Flex direction="column" gap="16" align="center">
						<Text
							size="24"
							weight="600"
							color="primary"
							align="center"
							:class="$style.title"
						>
							Liquidity Pools & Providing
						</Text>
						<Text
							size="16"
							weight="500"
							color="tertiary"
							height="16"
							align="center"
							:class="$style.description"
						>
							You can participate in events as a liquidity
							provider and earn payouts
						</Text>
					</Flex>

					<Flex direction="column" gap="24" align="center">
						<Button
							@click="activeStepIndex = 4"
							type="white"
							size="small"
						>
							Last step and you're ready
							<Icon name="login" size="16" color="black" />
						</Button>
						<Text size="12" weight="500" color="tertiary">
							Learn about pools in our docs
						</Text>
					</Flex>
				</Flex>

				<!-- Done Step -->
				<Flex
					v-else-if="activeStepIndex === 4"
					direction="column"
					gap="32"
					align="center"
					:class="$style.base"
					style="max-width: 490px"
				>
					<Flex direction="column" gap="16" align="center">
						<Text
							size="24"
							weight="600"
							color="primary"
							:class="$style.title"
						>
							Done!
						</Text>
						<Text
							size="16"
							weight="500"
							color="tertiary"
							height="16"
							align="center"
							:class="$style.description"
						>
							You can learn more about the application in the<br />
							docs or ask a question on our discord server
						</Text>
					</Flex>
					<!-- 
					<Flex direction="column" gap="16" wide>
						<Text size="13" weight="600" color="primary"
							>Interface Theme</Text
						>

						<Flex justify="between" wide>
							<Flex
								@click="selectedTheme = 'Dark'"
								direction="column"
								gap="12"
							>
								<Flex
									align="end"
									justify="center"
									:class="[
										$style.theme_card,
										$style.dark,
										$style.active,
									]"
								>
									<svg
										width="104"
										height="80"
										viewBox="0 0 104 80"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M0 16C0 14.8954 0.895431 14 2 14H102C103.105 14 104 14.8954 104 16V80H0V16Z"
											fill="#252528"
										/>
										<path
											d="M0 8C0 3.58172 3.58172 0 8 0H96C100.418 0 104 3.58172 104 8V8C104 9.10457 103.105 10 102 10H2C0.895432 10 0 9.10457 0 8V8Z"
											fill="#252528"
										/>
										<circle
											cx="9"
											cy="23"
											r="3"
											fill="white"
											fill-opacity="0.1"
										/>
										<circle
											cx="9"
											cy="39"
											r="3"
											fill="white"
											fill-opacity="0.1"
										/>
										<circle
											cx="9"
											cy="55"
											r="3"
											fill="white"
											fill-opacity="0.1"
										/>
										<circle
											cx="9"
											cy="71"
											r="3"
											fill="white"
											fill-opacity="0.1"
										/>
										<rect
											x="18"
											y="21"
											width="40"
											height="4"
											rx="2"
											fill="white"
											fill-opacity="0.1"
										/>
										<rect
											x="18"
											y="37"
											width="40"
											height="4"
											rx="2"
											fill="white"
											fill-opacity="0.1"
										/>
										<rect
											x="18"
											y="53"
											width="40"
											height="4"
											rx="2"
											fill="white"
											fill-opacity="0.1"
										/>
										<rect
											x="18"
											y="69"
											width="40"
											height="4"
											rx="2"
											fill="white"
											fill-opacity="0.1"
										/>
									</svg>
								</Flex>

								<Flex alig="center" gap="8">
									<Text
										size="13"
										weight="600"
										color="primary"
										height="11"
									>
										Dark
									</Text>
									<Icon
										v-if="selectedTheme === 'Dark'"
										name="check"
										size="16"
										color="blue"
									/>
								</Flex>
							</Flex>
							<Flex
								@click="selectedTheme = 'Light'"
								direction="column"
								gap="12"
							>
								<Flex
									align="end"
									justify="center"
									:class="[$style.theme_card, $style.light]"
								>
									<svg
										width="104"
										height="80"
										viewBox="0 0 104 80"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M0 16C0 14.8954 0.895431 14 2 14H102C103.105 14 104 14.8954 104 16V80H0V16Z"
											fill="white"
											fill-opacity="0.95"
										/>
										<path
											d="M0 8C0 3.58172 3.58172 0 8 0H96C100.418 0 104 3.58172 104 8C104 9.10457 103.105 10 102 10H2C0.895432 10 0 9.10457 0 8Z"
											fill="white"
											fill-opacity="0.95"
										/>
										<circle
											cx="9"
											cy="23"
											r="3"
											fill="black"
											fill-opacity="0.1"
										/>
										<circle
											cx="9"
											cy="39"
											r="3"
											fill="black"
											fill-opacity="0.1"
										/>
										<circle
											cx="9"
											cy="55"
											r="3"
											fill="black"
											fill-opacity="0.1"
										/>
										<circle
											cx="9"
											cy="71"
											r="3"
											fill="black"
											fill-opacity="0.1"
										/>
										<rect
											x="18"
											y="21"
											width="40"
											height="4"
											rx="2"
											fill="black"
											fill-opacity="0.1"
										/>
										<rect
											x="18"
											y="37"
											width="40"
											height="4"
											rx="2"
											fill="black"
											fill-opacity="0.1"
										/>
										<rect
											x="18"
											y="53"
											width="40"
											height="4"
											rx="2"
											fill="black"
											fill-opacity="0.1"
										/>
										<rect
											x="18"
											y="69"
											width="40"
											height="4"
											rx="2"
											fill="black"
											fill-opacity="0.1"
										/>
									</svg>
								</Flex>

								<Flex alig="center" gap="8">
									<Text
										size="13"
										weight="600"
										color="primary"
										height="11"
									>
										Light
									</Text>
									<Icon
										v-if="selectedTheme === 'Light'"
										name="check"
										size="16"
										color="blue"
									/>
								</Flex>
							</Flex>
							<Flex
								@click="selectedTheme = 'Midnight'"
								direction="column"
								gap="12"
							>
								<Flex
									align="end"
									justify="center"
									:class="[
										$style.theme_card,
										$style.midnight,
									]"
								>
									<svg
										width="104"
										height="80"
										viewBox="0 0 104 80"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M0 16C0 14.8954 0.895431 14 2 14H102C103.105 14 104 14.8954 104 16V80H0V16Z"
											fill="#171717"
										/>
										<path
											d="M0.5 16C0.5 15.1716 1.17157 14.5 2 14.5H102C102.828 14.5 103.5 15.1716 103.5 16V79.5H0.5V16Z"
											stroke="white"
											stroke-opacity="0.1"
										/>
										<path
											d="M0 8C0 3.58172 3.58172 0 8 0H96C100.418 0 104 3.58172 104 8C104 9.10457 103.105 10 102 10H2C0.895432 10 0 9.10457 0 8Z"
											fill="#171717"
										/>
										<path
											d="M0.5 8C0.5 3.85786 3.85786 0.5 8 0.5H96C100.142 0.5 103.5 3.85786 103.5 8C103.5 8.82843 102.828 9.5 102 9.5H2C1.17157 9.5 0.5 8.82843 0.5 8Z"
											stroke="white"
											stroke-opacity="0.1"
										/>
										<circle
											cx="9"
											cy="23"
											r="3"
											fill="white"
											fill-opacity="0.1"
										/>
										<circle
											cx="9"
											cy="39"
											r="3"
											fill="white"
											fill-opacity="0.1"
										/>
										<circle
											cx="9"
											cy="55"
											r="3"
											fill="white"
											fill-opacity="0.1"
										/>
										<circle
											cx="9"
											cy="71"
											r="3"
											fill="white"
											fill-opacity="0.1"
										/>
										<rect
											x="18"
											y="21"
											width="40"
											height="4"
											rx="2"
											fill="white"
											fill-opacity="0.1"
										/>
										<rect
											x="18"
											y="37"
											width="40"
											height="4"
											rx="2"
											fill="white"
											fill-opacity="0.1"
										/>
										<rect
											x="18"
											y="53"
											width="40"
											height="4"
											rx="2"
											fill="white"
											fill-opacity="0.1"
										/>
										<rect
											x="18"
											y="69"
											width="40"
											height="4"
											rx="2"
											fill="white"
											fill-opacity="0.1"
										/>
									</svg>
								</Flex>

								<Flex alig="center" gap="8">
									<Text
										size="13"
										weight="600"
										color="primary"
										height="11"
									>
										Midnight
									</Text>
									<Icon
										v-if="selectedTheme === 'Midnight'"
										name="check"
										size="16"
										color="blue"
									/>
								</Flex>
							</Flex>
						</Flex>
					</Flex>

					<Flex direction="column" gap="8" wide>
						<Text size="13" weight="600" color="primary">
							Currency
						</Text>

						<Flex justify="between" gap="8">
							<Selector
								v-for="item in currencyItems"
								@click="selectedCurrencyItem = item.name"
								:name="item.name"
								:selected="selectedCurrencyItem === item.name"
							>
								<template v-if="item.hint" #hint>
									<Text
										size="11"
										weight="600"
										color="tertiary"
									>
										{{ item.hint }}
									</Text>
								</template>
							</Selector>
						</Flex>

						<Text
							size="13"
							weight="500"
							color="tertiary"
							height="160"
						>
							Prices by Binance API
						</Text>
					</Flex> -->

					<Button @click="handleEnd" type="primary" size="small">
						Alright, let's start
						<Icon name="login" size="16" color="black" />
					</Button>
				</Flex>
			</transition>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	position: relative;

	height: 100%;
}

.slider {
	position: relative;
	width: 100%;
	min-height: 320px;

	mask-image: radial-gradient(
		ellipse farthest-side,
		rgba(255, 255, 255, 1),
		rgba(255, 255, 255, 0.9),
		rgba(255, 255, 255, 0)
	);
	-webkit-mask-image: radial-gradient(
		ellipse farthest-side,
		rgba(255, 255, 255, 1),
		rgba(255, 255, 255, 0.9),
		rgba(255, 255, 255, 0)
	);

	margin-top: 60px;
}

.circle_wrapper {
	position: absolute;
	top: 0;

	transform: translateY(-50%) translateX(-50%);

	border-radius: 50%;
	background: var(--card-bg);
	border: 8px solid var(--app-bg);

	transition: all 0.7s var(--bezier);
}

.circle {
	position: relative;
	min-width: 60px;
	min-height: 60px;

	border-radius: 50%;
	cursor: pointer;
	border: 1px solid var(--border);

	transition: all 0.2s ease;
}

.circle:hover {
	border: 1px solid var(--border-highlight);
}

.lines_icon {
	position: absolute;
	top: -40%;
}

.line {
	width: 100%;
	height: 2px;
	background: var(--border);

	transition: all 0.7s var(--bezier);
}

.event_card {
	width: 400px;

	margin: 0 90px;
}

.event_chart_img {
	max-width: 600px;
	user-select: none;
}

.theme_card {
	width: 140px;
	height: 100px;

	border-radius: 12px;
	cursor: pointer;
}

.theme_card svg {
	transition: all 0.2s ease;
}

.theme_card:hover svg {
	transform: scale(1.02);
}

.theme_card.dark {
	background: var(--app-bg);
	border: 2px solid var(--border);
}

.theme_card.light {
	background: #e3e3e3;
	border: 2px solid rgba(0, 0, 0, 0.3);
}

.theme_card.midnight {
	background: #1b1b1b;
	border: 2px solid var(--border);
}

.sa_badge {
	height: 60px;
	background: rgba(255, 255, 255, 0.05);

	border-radius: 8px;

	padding: 0 24px 0 8px;
}

.sa_badge img {
	width: 40px;
	height: 40px;
}

.sa_badge__btn {
	cursor: pointer;

	transition: fill 0.2s ease;
}

.sa_badge__btn:hover {
	fill: var(--text-secondary);
}

@media (max-width: 1050px) {
	.events_step {
		flex-direction: column;
		gap: 40px;
	}

	.event_card {
		min-width: 300px;
	}

	.stake_step {
		flex-direction: column;
		gap: 40px;
	}
}

@media (max-width: 800px) {
	.slider {
		margin-top: 0;
	}

	.event_chart_img {
		width: inherit;
	}
}

@media (max-width: 550px) {
	.title {
		font-size: 18px;
		line-height: 1.6;
	}

	.description {
		font-size: 14px;
	}

	.slider {
		min-height: 200px;
	}

	.circle_wrapper {
		opacity: 0;
	}

	.circle_wrapper.current {
		opacity: 1;
	}

	.event_card {
		width: 100%;
	}
}
</style>
