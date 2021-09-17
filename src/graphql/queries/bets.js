import gql from "graphql-tag"

export const getBetsByUser = gql`
    query getBetsByUser($event_id: Int, $address: String) {
        juster_bet(
            where: { event_id: { _eq: $event_id }, user_id: { _eq: $address } }
        ) {
            id
            side
            reward
            amount
        }
    }
`
