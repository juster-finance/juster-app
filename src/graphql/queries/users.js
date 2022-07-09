import gql from "graphql-tag"

export const getAllUsers = gql`
	query getAllUsers {
		user {
			address
		}
	}
`

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
			createdTime
			event {
				id
				closedOracleTime
			}
			feeCollectorId
			type
			opgHash
			userId
		}
	}
`

export const getTopLiquidityProviders = gql`
	query getTopLiquidityProviders {
		user(order_by: { totalProviderReward: desc }, limit: 5) {
			address
			totalProviderReward
		}
	}
`
export const getTopBettors = gql`
	query getTopBettors {
		user(order_by: { totalBetsCount: desc }, limit: 5) {
			address
			totalBetsCount
		}
	}
`
