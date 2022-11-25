import gql from "graphql-tag"

export const getEventById = gql`
	query getEventById($id: Int!) {
		eventByPk(id: $id) {
			id
			status
			betsCloseTime
			creatorId
			poolAboveEq
			poolBelow
			totalBetsAmount
			totalLiquidityProvided
			totalLiquidityShares
			totalValueLocked
			liquidityPercent
			measurePeriod
			closedOracleTime
			createdTime
			startRate
			closedRate
			winnerBets
			targetDynamics
			currencyPair {
				symbol
				id
			}
			bets {
				id
				side
				reward
				amount
				createdTime
				userId
				eventId
				opgHash
			}
			deposits {
				amountAboveEq
				amountBelow
				eventId
				id
				userId
				createdTime
				shares
				opgHash
			}
		}
	}
`

export const getAllEvents = gql`
	query getAllEvents {
		event(order_by: { createdTime: desc }) {
			id
			status
			betsCloseTime
			creatorId
			currencyPair {
				symbol
				id
			}
			poolAboveEq
			poolBelow
			totalBetsAmount
			totalLiquidityProvided
			totalLiquidityShares
			totalValueLocked
			liquidityPercent
			measurePeriod
			closedOracleTime
			createdTime
			startRate
			closedRate
			winnerBets
			targetDynamics
			bets {
				id
				side
				reward
				amount
				createdTime
				userId
				eventId
				opgHash
			}
			deposits {
				amountAboveEq
				amountBelow
				eventId
				id
				userId
				createdTime
				shares
				opgHash
			}
		}
	}
`

export const getEventsByStatus = gql`
	query getEventsByStatus($status: [String]) {
		event(where: { status: { _in: $status } }) {
			id
			status
			betsCloseTime
			creatorId
			currencyPair {
				symbol
				id
			}
			poolAboveEq
			poolBelow
			totalBetsAmount
			totalLiquidityProvided
			totalLiquidityShares
			totalValueLocked
			liquidityPercent
			measurePeriod
			closedOracleTime
			createdTime
			startRate
			closedRate
			winnerBets
			targetDynamics
			bets {
				id
				side
				reward
				amount
				createdTime
				userId
				eventId
				opgHash
			}
			deposits {
				amountAboveEq
				amountBelow
				eventId
				id
				userId
				createdTime
				shares
				opgHash
			}
		}
	}
`

export const getEventsByMarket = gql`
	query getEventsByMarket($id: Int, $status: String) {
		event(
			where: { currencyPairId: { _eq: $id }, status: { _eq: $status } }
			order_by: { createdTime: desc }
		) {
			id
			status
			betsCloseTime
			creatorId
			currencyPair {
				symbol
				id
			}
			poolAboveEq
			poolBelow
			totalBetsAmount
			totalLiquidityProvided
			totalLiquidityShares
			totalValueLocked
			liquidityPercent
			measurePeriod
			closedOracleTime
			createdTime
			startRate
			closedRate
			winnerBets
			targetDynamics
			bets {
				id
				side
				reward
				amount
				createdTime
				userId
				eventId
				opgHash
			}
			deposits {
				amountAboveEq
				amountBelow
				eventId
				id
				userId
				createdTime
				shares
				opgHash
			}
		}
	}
`

export const getTopEvents = gql`
	query getTopEvents($limit: Int) {
		event(
			where: { status: { _eq: "NEW" } }
			order_by: { id: desc }
			limit: $limit
		) {
			id
			status
			betsCloseTime
			creatorId
			currencyPair {
				symbol
				id
			}
			poolAboveEq
			poolBelow
			totalBetsAmount
			totalLiquidityProvided
			totalLiquidityShares
			totalValueLocked
			liquidityPercent
			measurePeriod
			closedOracleTime
			createdTime
			startRate
			closedRate
			winnerBets
			targetDynamics
			bets {
				id
				side
				reward
				amount
				createdTime
				userId
				eventId
				opgHash
			}
			deposits {
				amountAboveEq
				amountBelow
				eventId
				id
				userId
				createdTime
				shares
				opgHash
			}
		}
	}
`

export const getEventsWithUserPosition = gql`
	query getEventsWithUserPosition($userId: String) {
		event(
			where: {
				bets: { userId: { _eq: $userId } }
				status: { _in: ["NEW", "STARTED"] }
			}
		) {
			id
			status
			betsCloseTime
			creatorId
			currencyPair {
				symbol
				id
			}
			poolAboveEq
			poolBelow
			totalBetsAmount
			totalLiquidityProvided
			totalLiquidityShares
			totalValueLocked
			liquidityPercent
			measurePeriod
			closedOracleTime
			createdTime
			startRate
			closedRate
			winnerBets
			targetDynamics
			bets {
				id
				side
				reward
				amount
				createdTime
				userId
				eventId
				opgHash
			}
			deposits {
				amountAboveEq
				amountBelow
				eventId
				id
				userId
				createdTime
				shares
				opgHash
			}
		}
	}
`

export const getEventParticipants = gql`
	query getEventParticipants($id: bigint) {
		event(where: { id: { _eq: $id } }) {
			positions {
				userId
				liquidityProvidedAboveEq
				liquidityProvidedBelow
				rewardAboveEq
				rewardBelow
				eventId
				shares
			}
		}
	}
`
