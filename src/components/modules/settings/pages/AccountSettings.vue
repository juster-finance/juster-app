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

/**
 * Store
 */
import { useAccountStore } from "@store/account"

const accountStore = useAccountStore()

const address = ref(accountStore.pkh)
</script>

<template>
	<Flex direction="column" gap="40">
		<Flex align="center" :class="$style.avatar_card">
			<img
				:src="`https://services.tzkt.io/v1/avatars/${accountStore.pkh}`"
				alt="avatar"
			/>

			<div :class="$style.divider" />

			<Flex justify="between" align="center" wide>
				<Flex direction="column" gap="8">
					<Text size="12" weight="600" color="secondary">
						Automatically generated avatar
					</Text>
					<Text size="12" weight="500" color="tertiary">
						Created by TzKT service
					</Text>
				</Flex>

				<Flex align="center" gap="12">
					<Icon name="copy_1" size="16" color="tertiary" />
					<Icon name="open_link" size="16" color="tertiary" />
				</Flex>
			</Flex>
		</Flex>

		<Flex direction="column" gap="24">
			<Input
				v-model="address"
				label="Wallet Address"
				placeholder="Your wallet address"
				hint="Connected with Temple Wallet"
				disabled
			/>

			<Flex direction="column" gap="16">
				<Flex direction="column" gap="8">
					<Text size="13" weight="600" color="primary">
						Alias Verification
					</Text>
					<Text size="13" weight="500" color="tertiary" height="16">
						Verify your account on TzKT and customize your profile
						by providing profile name, avatar and social links
					</Text>
				</Flex>

				<Button
					type="secondary"
					size="medium"
					link="https://profiles.tzkt.io/"
					block
				>
					<Icon name="verified" size="16" color="secondary" />
					Go to TzKT Profiles
				</Button>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.avatar_card {
	height: 60px;

	background: rgba(255, 255, 255, 0.03);
	border-radius: 8px;

	padding: 0 22px 0 10px;
}

.avatar_card img {
	width: 40px;
	height: 40px;
}

.divider {
	width: 2px;
	height: 28px;

	background: var(--border);
	border-radius: 50px;

	margin: 0 16px 0 10px;
}
</style>
