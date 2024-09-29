<script setup>
/**
 * Vendor
 */
import { TonConnectUIProvider  } from '@townsquarelabs/ui-vue';
import { tonConnect } from '@config'

/**
 * Base
 */
import App from "@/App.vue"

const tonConnectOptions = {
	manifestUrl: tonConnect.tonConnectManifestUrl,
};
</script>

<template>
	<TonConnectUIProvider :options="tonConnectOptions">
		<App />
	</TonConnectUIProvider>
</template>
