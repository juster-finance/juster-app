import { getEnvVariable } from "@/services/utils/env"

export const dipdup = {
	mainnet: {
		graphq: getEnvVariable('VITE_DIPDUP_GRAPHQ_MAINNET'),
		ws: getEnvVariable('VITE_DIPDUP_WS_MAINNET'),
	},
	testnet: {
		graphq: getEnvVariable('VITE_DIPDUP_GRAPHQ_TESTNET'),
		ws: getEnvVariable('VITE_DIPDUP_WS_TESTNET'),
	}
}

export const demoMode = {
	baseUrl: getEnvVariable('VITE_DEMO_MODE_BACKEND_BASE_URL'),
	walletPayloadTokenExpiresInSeconds: 900,
	newUserBalance: 10000,
	topUpAmount: 10000,
	minBalanceToTopUp: 10,
}

export const tonConnect = {
	tonConnectManifestUrl: `${getEnvVariable('VITE_APP_BASE_URL')}/tonconnect-manifest.json`,
}

export const token = {
	name: 'TON',
	symbol: 'TON',
	currencyIconFileName: 'ton.png'
}

export const localStorageKeys = {
	AUTH_TOKEN: 'auth_token',
	IS_ONBOARDING_SHOWN: 'is_onboarding_shown'
}

export const supportedMarkets = {
	"ETH-USD": { target: "Ethereum", description: "Ethereum / U.S. Dollar" },
	"BTC-USD": { target: "Bitcoin", description: "Bitcoin / U.S. Dollar" },
	"TON-USD": { target: "TON", description: "TON / U.S. Dollar" },
}

export const sanity = {
	id: "2tokh3zd",
}

export const rpcNodes = {
	mainnet: [
		{
			code: "tzkt",
			name: "TZKT Mainnet",
			url: "https://rpc.tzkt.io/mainnet",
		},
	],
	testnet: [
		{
			code: "tzkttestnet",
			name: "TZKT Testnet",
			url: "https://rpc.tzkt.io/ghostnet",
		},
	],
}

export const verifiedMakers = {
	mainnet: [
		"0:fcb91a3a3816d0f7b8c2c76108b8a9bc5a6b7a55bd79f8ab101c52db29232260"
	],
	testnet: [
		"0:fcb91a3a3816d0f7b8c2c76108b8a9bc5a6b7a55bd79f8ab101c52db29232260"
	],
}

export const contracts = {
	mainnet: "",
	testnet: "",
}
