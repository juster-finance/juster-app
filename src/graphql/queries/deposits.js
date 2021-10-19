import gql from "graphql-tag"

export const getDepositsByEvent = gql`
    query getDepositsByEvent($eventId: Int) {
        deposit(where: { eventId: { _eq: $eventId } }) {
            amountAboveEq
            amountBelow
            eventId
            id
            userId
            createdTime
            shares
        }
    }
`
