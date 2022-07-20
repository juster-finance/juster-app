export const dipdup = {
	mainnet: {
		graphq: "https://juster.dipdup.net/v1/graphql",
		ws: "wss://juster.dipdup.net/v1/graphql",
	},
	testnet: {
		graphq: `https://api.ithacanet.juster.fi/v1/graphql`,
		ws: "wss://api.ithacanet.juster.fi/v1/graphql",
	},
}

export const supportedMarkets = {
	"ETH-USD": { target: "Ethereum", description: "Ethereum / U.S. Dollar" },
	"XTZ-USD": { target: "Tezos", description: "Tezos / U.S. Dollar" },
	"BTC-USD": { target: "Bitcoin", description: "Bitcoin / U.S. Dollar" },
}

export const sanity = {
	id: "7iinpn2j",
}

export const rpcNodes = {
	mainnet: [
		{
			name: "TZKT Mainnet",
			url: "https://rpc.tzkt.io/mainnet",
		},
		{
			name: "SmartPy Mainnet",
			url: "https://mainnet.smartpy.io",
		},
		{
			name: "TzBeta Mainnet",
			url: "https://rpc.tzbeta.net",
		},
		{
			name: "LetzBake!",
			url: "https://teznode.letzbake.com",
		},
		{
			name: "ATEZA",
			url: "https://rpc-mainnet.ateza.io",
		},
	],
	testnet: [
		{
			name: "TZKT Testnet",
			url: "https://rpc.tzkt.io/ghostnet",
		},
	],
}

export const verifiedMakers = {
	testnet: [
		"tz1RVJBJDxohFBHLK2hw6JTrKbz6oLSLERU3",
		"KT1T4zTEZQLbFeKoR8sRihozyS4DAnyicYE3",
	],
	mainnet: ["tz1h5frRwDbJMGyTPntdwMC8i745q2Z1fzyF"],
}

export const contracts = {
	testnet: "KT1Feq9iRBBhpSBdPF1Y7Sd7iJu7uLqqRf1A",
	mainnet: "KT1D6XTy8oAHkUWdzuQrzySECCDMnANEchQq",
}
