import gql from "graphql-tag"

export const getEventById = gql`
    query getEventById($id: Int!) {
        juster_event_by_pk(id: $id) {
            id
            status
            bets_close_time
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
            start_rate
            closed_rate
            winner_bets
            target_dynamics
            currency_pair {
                symbol
            }
            bets {
                amount
                side
            }
        }
    }
`

export const getEventsBySymbol = gql`
    query getEventsBySymbol($id: Int, $status: String) {
        juster_event(
            where: { currency_pair_id: { _eq: $id }, status: { _eq: $status } }
            order_by: { created_time: desc }
        ) {
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
            start_rate
            closed_rate
            winner_bets
            target_dynamics
        }
    }
`

export const getTopEvents = gql`
    query getTopEvents {
        juster_event(
            where: { total_value_locked: { _eq: "1" }, status: { _eq: "NEW" } }
            order_by: { id: desc }
            limit: 3
        ) {
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
            start_rate
            closed_rate
            winner_bets
            target_dynamics
        }
    }
`

export const getEventParticipants = gql`
    query getEventParticipants($id: Int) {
        juster_event(where: { id: { _eq: $id } }) {
            positions {
                user_id
                liquidity_provided_above_eq
                liquidity_provided_below
                reward_above_eq
                reward_below
                event_id
                shares
            }
        }
    }
`
