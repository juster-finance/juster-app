export const dipdup = {
	mainnet: {
		graphq: "http://localhost:5501/v1/graphql",
		ws: "ws://localhost:5501/v1/graphql",
	},
	testnet: {
		graphq: "http://localhost:5501/v1/graphql",
		ws: "ws://localhost:5501/v1/graphql",
	}
}

export const demoMode = {
	baseUrl: "http://localhost:5502",
	walletPayloadTokenExpiresInSeconds: 900
}

export const token = {
	name: 'TON',
	symbol: 'TON',
	currencyIconFileName: 'ton.png'
}

export const localStorageKeys = {
	AUTH_TOKEN: 'auth_token'
}

export const supportedMarkets = {
	"ETH-USD": { target: "Ethereum", description: "Ethereum / U.S. Dollar" },
	"BTC-USD": { target: "Bitcoin", description: "Bitcoin / U.S. Dollar" },
	"TON-USD": { target: "TON", description: "TON / U.S. Dollar" },
}

export const sanity = {
	id: "",
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
