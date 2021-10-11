import gql from "graphql-tag"

export const getQuotesBySymbol = gql`
    query getQuotesBySymbol($id: Int, $ts: timestamptz, $limit: Int) {
        quotesWma(
            where: { currencyPairId: { _eq: $id }, timestamp: { _lt: $ts } }
            order_by: { timestamp: desc }
            limit: $limit
        ) {
            currencyPairId
            price
            timestamp
        }
    }
`
export const getQuoteByTimestamp = gql`
    query getQuoteByTimestamp($id: Int, $ts: timestamptz) {
        quotesWma(
            where: { currencyPairId: { _eq: $id }, timestamp: { _eq: $ts } }
            order_by: { timestamp: desc }
            limit: 1
        ) {
            currencyPairId
            price
            timestamp
        }
    }
`
