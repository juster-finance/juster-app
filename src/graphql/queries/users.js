import gql from "graphql-tag"

export const getUser = gql`
    query getUser($address: String) {
        user(where: { address: { _eq: $address } }) {
            totalBetsAmount
            totalBetsCount
            totalFeesCollected
            totalLiquidityProvided
            totalProviderReward
            totalReward
            totalWithdrawn
        }
    }
`

export const getUserWithdrawals = gql`
    query getUserWithdrawals($address: String) {
        withdrawal(
            where: { userId: { _eq: $address } }
            order_by: { id: desc }
        ) {
            id
            amount
            event {
                id
                closedOracleTime
            }
            feeCollectorId
            type
        }
    }
`
