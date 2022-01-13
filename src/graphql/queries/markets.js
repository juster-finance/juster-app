import gql from "graphql-tag"

export const getMarkets = gql`
    query getMarkets {
        currencyPair {
            symbol
            id
            totalEvents
            totalValueLocked
            totalVolume
        }
    }
`
