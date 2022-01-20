import gql from "graphql-tag"

export const getQuotesByMarket = gql`
    query getQuotesByMarket($id: Int, $limit: Int, $offset: Int) {
        quotesWma(
            where: { currencyPairId: { _eq: $id } }
            order_by: { timestamp: desc }
            limit: $limit
            offset: $offset
        ) {
            currencyPairId
            price
            timestamp
        }
    }
`

export const getQuoteByRange = gql`
    query getQuoteByRange($id: Int, $tsLt: timestamptz, $tsGt: timestamptz) {
        quotesWma(
            where: {
                timestamp: { _gte: $tsGt, _lte: $tsLt }
                currencyPairId: { _eq: $id }
            }
            order_by: { timestamp: desc }
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

export const getTVLByEventId = gql`
    query getTVLByEventId($id: Int) {
        totalValueLocked(where: { eventId: { _eq: $id } }) {
            eventId
            cumSum
            createdTime
            amount
        }
    }
`
