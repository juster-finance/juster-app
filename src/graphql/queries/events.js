import gql from "graphql-tag"

export const getEventById = gql`
    query getEventById($id: Int!) {
        eventByPk(id: $id) {
            id
            status
            betsCloseTime
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
            }
            bets {
                amount
                side
            }
        }
    }
`

export const getAllEvents = gql`
    query getAllEvents($status: String) {
        event(
            where: { status: { _eq: $status } }
            order_by: { createdTime: desc }
        ) {
            id
            status
            betsCloseTime
            currencyPair {
                symbol
            }
            bets {
                amount
                side
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
        }
    }
`

export const getEventsBySymbol = gql`
    query getEventsBySymbol($id: Int, $status: String) {
        event(
            where: { currencyPairId: { _eq: $id }, status: { _eq: $status } }
            order_by: { createdTime: desc }
        ) {
            id
            status
            betsCloseTime
            currencyPair {
                symbol
            }
            bets {
                amount
                side
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
        }
    }
`

export const getTopEvents = gql`
    query getTopEvents {
        event(
            where: { totalValueLocked: { _eq: "1" }, status: { _eq: "NEW" } }
            order_by: { id: desc }
            limit: 3
        ) {
            id
            status
            betsCloseTime
            currencyPair {
                symbol
            }
            bets {
                amount
                side
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
        }
    }
`

export const getEventParticipants = gql`
    query getEventParticipants($id: Int) {
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
