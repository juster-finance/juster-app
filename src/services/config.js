export const dipdup = {
    uri: {
        graphq: `https://api.granadanet.juster.fi/v1/graphql`,
        subscription: "wss://api.granadanet.juster.fi/v1/graphql",
    },
}

export const supportedSymbols = {
    "ETH-USD": { description: "Ethereum / US Dollar" },
    "XTZ-USD": { description: "Tezos / US Dollar" },
    "BTC-USD": { description: "Bitcoin / US Dollar" },
}

export const sanity = {
    id: "7iinpn2j",
}

export const rpcNodes = [
    {
        name: "SmartPy Granadanet",
        url: "https://granadanet.smartpy.io",
    },
    {
        name: "TzKT Granadanet",
        url: "https://rpc.tzkt.io/granadanet",
    },
]
