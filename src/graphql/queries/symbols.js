import gql from "graphql-tag"

export const getSymbols = gql`
    query getSymbols {
        juster_currencypair {
            symbol
            id
            total_events
            total_value_locked
            total_volume
        }
    }
`

export const getSymbolById = gql`
    query getSymbolById($id: Int!) {
        juster_currencypair_by_pk(id: $id) {
            symbol
            id
            total_events
            total_value_locked
            total_volume
        }
    }
`
