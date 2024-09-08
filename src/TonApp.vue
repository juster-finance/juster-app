<script setup>
/**
 * Vendor
 */
import { TonConnectUIProvider  } from '@townsquarelabs/ui-vue';

/**
 * Base
 */
import App from "@/App.vue"

// TODO: #1 Fix Url and manifest content
const tonConnectOptions = {
	manifestUrl:"http://localhost:5173/tonconnect-manifest.json",
};
</script>

<template>
	<TonConnectUIProvider :options="tonConnectOptions">
		<App />
	</TonConnectUIProvider>
</template>
