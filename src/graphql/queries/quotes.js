import gql from "graphql-tag"

export const getQuotesBySymbol = gql`
    query getQuotesBySymbol($id: Int, $ts: timestamptz, $limit: Int) {
        juster_quotes_wma(
            where: { currency_pair_id: { _eq: $id }, timestamp: { _lt: $ts } }
            order_by: { timestamp: desc }
            limit: $limit
        ) {
            currency_pair_id
            price
            timestamp
        }
    }
`
export const getQuoteByTimestamp = gql`
    query getQuoteByTimestamp($id: Int, $ts: timestamptz) {
        juster_quotes_wma(
            where: { currency_pair_id: { _eq: $id }, timestamp: { _eq: $ts } }
            order_by: { timestamp: desc }
            limit: 1
        ) {
            currency_pair_id
            price
            timestamp
        }
    }
`
