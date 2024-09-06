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
	baseUrl: "http://localhost:5502"
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
		"0QCtT-Fkel-ySt46KrZX5APrfxHFCHSkYlq59cl5Fc3JCfQc"
	],
	testnet: [
		"0QCtT-Fkel-ySt46KrZX5APrfxHFCHSkYlq59cl5Fc3JCfQc"
	],
}

export const contracts = {
	mainnet: "",
	testnet: "",
}
