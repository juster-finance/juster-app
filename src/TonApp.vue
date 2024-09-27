<script setup>
/**
 * Vendor
 */
import { TonConnectUIProvider  } from '@townsquarelabs/ui-vue';

/**
 * Base
 */
import App from "@/App.vue"

const tonConnectOptions = {
	manifestUrl:"https://juster.io/tonconnect-manifest.json",
};
</script>

<template>
	<TonConnectUIProvider :options="tonConnectOptions">
		<App />
	</TonConnectUIProvider>
</template>
