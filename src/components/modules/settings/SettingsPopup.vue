<script setup>
/**
 * Vendor
 */
import { ref } from "vue"

/**
 * UI
 */
import Input from "@ui/Input.vue"
import Button from "@ui/Button.vue"
import Toggle from "@ui/Toggle.vue"

/**
 * Store
 */
import { useAccountStore } from "@store/account"

const accountStore = useAccountStore()
</script>

<template>
	<Flex direction="column" gap="4" :class="$style.wrapper">
		<!-- Settings Navigation -->
		<Flex align="center" gap="12" :class="$style.head">
			<Flex align="center" gap="8">
				<Icon name="user" size="12" color="secondary" />
				<Text size="13" weight="600" color="primary" height="11">
					Account
				</Text>
			</Flex>

			<Flex align="center" gap="8">
				<Icon name="spark" size="12" color="secondary" />
				<Text size="13" weight="600" color="primary" height="11">
					Appearance
				</Text>
			</Flex>

			<Flex align="center" gap="8">
				<Icon name="price_event" size="12" color="secondary" />
				<Text size="13" weight="600" color="primary" height="11">
					Staking
				</Text>
			</Flex>

			<Flex align="center" gap="8">
				<Icon name="bolt" size="12" color="secondary" />
				<Text size="13" weight="600" color="primary" height="11">
					Advanced
				</Text>
			</Flex>
		</Flex>

		<!-- Base -->
		<Flex :class="$style.base">
			<!-- Account Tab -->
			<template>
				<Flex direction="column" gap="40">
					<!-- Account -->
					<Flex direction="column" gap="24">
						<!-- Address -->
						<Input
							label="My Wallet"
							subtext="Connected with Temple Wallet"
							:placeholder="account.pkh"
							disabled
						/>

						<!-- Alias Verification -->
						<Flex direction="column" gap="16">
							<Flex direction="column" gap="8">
								<Text size="13" color="primary" weight="600">
									Alias Verification
								</Text>
								<Text
									size="13"
									weight="500"
									color="tertiary"
									height="16"
								>
									Verify your account on TzKT explorer and
									customize your profile by providing profile
									name, avatar and social links.
								</Text>
							</Flex>

							<Button type="secondary" size="medium">
								<Icon
									name="verification"
									size="16"
									color="secondary"
								/>
								TzKT Alias Verification
							</Button>
						</Flex>

						<!-- Network -->
						<Flex justify="between">
							<Flex direction="column" gap="8">
								<Text size="13" color="primary" weight="600">
									Test Network
								</Text>
								<Text
									size="13"
									weight="500"
									color="tertiary"
									height="16"
								>
									Get access to advanced features for
									debugging this application
								</Text>
							</Flex>

							<Toggle />
						</Flex>
					</Flex>

					<!-- Authorization -->
					<Flex direction="column" gap="24">
						<Text size="16" weight="600" color="primary">
							Authorization
						</Text>

						<Flex direction="column" gap="16">
							<Button type="secondary" size="medium">
								<Icon
									name="arrow"
									size="16"
									color="secondary"
								/>
								Switch Account
							</Button>
							<Button type="secondary" size="medium">
								<Icon
									name="settings"
									size="16"
									color="secondary"
								/>
								Custom Authorization
							</Button>
							<Button type="secondary" size="medium">
								<Icon
									name="logout"
									size="16"
									color="secondary"
								/>
								Logout
							</Button>
						</Flex>
					</Flex>
				</Flex>
			</template>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	height: 530px;
}

.head {
	height: 56px;

	background: var(--card-bg);
	border-radius: 8px 8px 4px 4px;

	padding: 0 20px;
}

.base {
	background: var(--card-bg);
	border-radius: 4px 4px 8px 8px;

	padding: 20px;
}
</style>
