export const dipdup = {
    mainnet: {
        graphq: "https://juster.dipdup.net/v1/graphql",
        ws: "wss://juster.dipdup.net/v1/graphql",
    },
    ithacanet: {
        graphq: `https://api.ithacanet.juster.fi/v1/graphql`,
        ws: "wss://api.ithacanet.juster.fi/v1/graphql",
    },
}

export const supportedMarkets = {
    "ETH-USD": { target: "Ethereum", description: "Ethereum / USD" },
    "XTZ-USD": { target: "Tezos", description: "Tezos / USD" },
    "BTC-USD": { target: "Bitcoin", description: "Bitcoin / USD" },
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
    ithacanet: [
        {
            name: "TZKT Testnet",
            url: "https://rpc.tzkt.io/ithacanet",
        },
    ],
}

export const verifiedMakers = {
    ithacanet: [
        "tz1RVJBJDxohFBHLK2hw6JTrKbz6oLSLERU3",
        "KT1GEfCcvPKhLe1vrpYZtua8eBpUsVjfiDRo",
    ],
    mainnet: [
        "tz1h5frRwDbJMGyTPntdwMC8i745q2Z1fzyF",
        "KT1AatPqLrUumRZz4FRC9nG1acTvyizeQ4ni",
        "KT1VWjtgFCM1bs3QRcqHcP31dowjDgdgVtxR",
        "KT1JKiMQWE8hcSGq8j89mYDEY4DLpTE4vEaD",
    ],
}

export const contracts = {
    ithacanet: "KT1Feq9iRBBhpSBdPF1Y7Sd7iJu7uLqqRf1A",
    mainnet: "KT1D6XTy8oAHkUWdzuQrzySECCDMnANEchQq",
}
