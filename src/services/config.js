export const dipdup = {
	mainnet: {
		graphq: "https://juster.dipdup.net/v1/graphql",
		ws: "wss://juster.dipdup.net/v1/graphql",
	},
	testnet: {
		graphq: `https://api.ithacanet-pool.juster.fi/v1/graphql`,
		ws: "wss://api.ithacanet-pool.juster.fi/v1/graphql",
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
			code: "tzkt",
			name: "TZKT Mainnet",
			url: "https://rpc.tzkt.io/mainnet",
		},
		{
			code: "smartpy",
			name: "SmartPy Mainnet",
			url: "https://mainnet.smartpy.io",
		},
		{
			code: "tzbeta",
			name: "TzBeta Mainnet",
			url: "https://rpc.tzbeta.net",
		},
		{
			code: "letzbake",
			name: "LetzBake!",
			url: "https://teznode.letzbake.com",
		},
		{
			code: "ateza",
			name: "ATEZA",
			url: "https://rpc-mainnet.ateza.io",
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
	testnet: [
		"tz1RVJBJDxohFBHLK2hw6JTrKbz6oLSLERU3",
		"KT1T4zTEZQLbFeKoR8sRihozyS4DAnyicYE3",
		"KT1M6fueToCaYBTeG25XZEFCa7YXcNDMn12x",
		"KT19XF9XW5osWpkQAZnpQkdyJsKfPuskk7JT",
		"KT1Jte8DZvUghZ9RE2Lis87tSA3GsRQqNvMC",
		"KT1AEzrdJvtd2TkLGhrQokhxkVSxUN4dbsot",
		"KT1FkBgjipxkupB9oXjmvKTgzdQAdHsPPfpp",
		"KT1DNt8ZE7HifCA6N7XiJtDBxhkMc3Bpaevm",
		"KT1JcMF3L3FkK3rszRGGxyT4tQt4JeCb7RWC",
		"KT1XELoPAA945ExHXS9mfG1Tx3gDUn7ph9cp",
		"KT1TNE38c5BFc9hXXAGBJ3fmXCPtHKV3Ng81",
		"KT1MRHBX9DoLYsmN58ediuARpzH4QdgMAQz8",
	],
	mainnet: ["tz1h5frRwDbJMGyTPntdwMC8i745q2Z1fzyF"],
}

export const contracts = {
	testnet: "KT1Feq9iRBBhpSBdPF1Y7Sd7iJu7uLqqRf1A",
	mainnet: "KT1D6XTy8oAHkUWdzuQrzySECCDMnANEchQq",
}
