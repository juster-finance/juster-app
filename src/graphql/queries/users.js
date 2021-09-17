import gql from "graphql-tag"

export const getUser = gql`
    query getUser($address: String) {
        juster_user(where: { address: { _eq: $address } }) {
            total_bets_amount
            total_bets_count
            total_fees_collected
            total_liquidity_provided
            total_provider_reward
            total_reward
            total_withdrawn
        }
    }
`

export const getUserWithdrawals = gql`
    query getUserWithdrawals($address: String) {
        juster_withdrawal(
            where: { user_id: { _eq: $address } }
            order_by: { id: desc }
        ) {
            id
            amount
            event {
                id
                closed_oracle_time
            }
            fee_collector_id
            type
        }
    }
`
