import gql from "graphql-tag"

export const getSymbols = gql`
    query getSymbols {
        currencypair {
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
        currencypairByPk(id: $id) {
            symbol
            id
            totalEvents
            totalValueLocked
            totalVolume
        }
    }
`
