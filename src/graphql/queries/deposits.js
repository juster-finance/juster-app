import gql from "graphql-tag"

export const getDepositsByEvent = gql`
    query getDepositsByEvent($event_id: Int) {
        juster_deposit(where: { event_id: { _eq: $event_id } }) {
            amount_above_eq
            amount_below
            event_id
            id
            user_id
            created_time
            shares
        }
    }
`
