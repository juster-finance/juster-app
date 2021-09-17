import gql from "graphql-tag"

export const getSymbols = gql`
    query getSymbols {
        juster_currencypair {
            symbol
            id
        }
    }
`

export const getSymbolById = gql`
    query getSymbolById($id: Int!) {
        juster_currencypair_by_pk(id: $id) {
            symbol
            id
        }
    }
`
