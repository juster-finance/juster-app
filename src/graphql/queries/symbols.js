import gql from "graphql-tag"

export const getSymbols = gql`
    query getSymbols {
        currencyPair {
            symbol
            id
            totalEvents
            totalValueLocked
            totalVolume
        }
    }
`

export const getSymbolById = gql`
    query getSymbolById($id: Int!) {
        currencyPairByPk(id: $id) {
            symbol
            id
            totalEvents
            totalValueLocked
            totalVolume
        }
    }
`
