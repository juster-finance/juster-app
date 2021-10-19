import gql from "graphql-tag"

export const getBetsByEvent = gql`
    query getBetsByEvent($eventId: Int) {
        bet(where: { eventId: { _eq: $eventId } }) {
            id
            side
            reward
            amount
            createdTime
            userId
        }
    }
`

export const getBetsByUser = gql`
    query getBetsByUser($eventId: Int, $address: String) {
        bet(
            where: { eventId: { _eq: $eventId }, userId: { _eq: $address } }
        ) {
            id
            side
            reward
            amount
            createdTime
            userId
        }
    }
`
