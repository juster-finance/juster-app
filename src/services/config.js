export const dipdup = {
    uri: {
        graphq: `https://api.hangzhounet.juster.fi/v1/graphql`,
        subscription: "wss://api.hangzhounet.juster.fi/v1/graphql",
    },
}

export const supportedMarkets = {
    "ETH-USD": { description: "Ethereum / US Dollar" },
    "XTZ-USD": { description: "Tezos / US Dollar" },
    "BTC-USD": { description: "Bitcoin / US Dollar" },
}

export const sanity = {
    id: "7iinpn2j",
}

export const rpcNodes = [
    {
        name: "TzKT Hangzhou2net",
        url: "https://rpc.tzkt.io/hangzhou2net",
    },
    {
        name: "SmartPy Granadanet",
        url: "https://granadanet.smartpy.io",
    },
]
