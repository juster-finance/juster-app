import gql from "graphql-tag"

export const getAllUserPositions = gql`
    query getAllUserPositions($address: String) {
        juster_position(
            where: { user_id: { _eq: $address } }
            order_by: { id: desc }
        ) {
            id
            value
            withdrawn
            event {
                id
                status
                bets_close_time
                currency_pair {
                    symbol
                }
                bets {
                    amount
                    side
                }
                pool_above_eq
                pool_below
                total_bets_amount
                total_liquidity_provided
                total_liquidity_shares
                total_value_locked
                liquidity_percent
                measure_period
                closed_oracle_time
                created_time
                target_dynamics
            }
        }
    }
`

export const getUserPositionsForWithdrawal = gql`
    query getUserPositionsForWithdrawal($address: String) {
        juster_position(
            where: {
                user_id: { _eq: $address }
                withdrawn: { _eq: false }
                value: { _gt: 0 }
                event: { status: { _eq: "FINISHED" } }
            }
            order_by: { id: desc }
        ) {
            id
            value
            withdrawn
            reward_above_eq
            reward_below
            event {
                id
                status
                bets_close_time
                currency_pair {
                    symbol
                }
                bets {
                    amount
                    side
                }
                pool_above_eq
                pool_below
                total_bets_amount
                total_liquidity_provided
                total_liquidity_shares
                total_value_locked
                liquidity_percent
                measure_period
                closed_oracle_time
                created_time
                target_dynamics
            }
        }
    }
`
