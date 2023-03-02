export const event = {
	id: true,
	status: true,
	betsCloseTime: true,
	creatorId: true,
	poolAboveEq: true,
	poolBelow: true,
	totalBetsAmount: true,
	totalLiquidityProvided: true,
	totalLiquidityShares: true,
	totalValueLocked: true,
	liquidityPercent: true,
	measurePeriod: true,
	closedOracleTime: true,
	measureOracleStartTime: true,
	createdTime: true,
	startRate: true,
	closedRate: true,
	winnerBets: true,
	targetDynamics: true,
	currencyPair: {
		symbol: true,
		id: true,
	},
	bets: {
		id: true,
		side: true,
		reward: true,
		amount: true,
		createdTime: true,
		userId: true,
		eventId: true,
		opgHash: true,
	},
	deposits: {
		amountAboveEq: true,
		amountBelow: true,
		eventId: true,
		id: true,
		userId: true,
		createdTime: true,
		shares: true,
		opgHash: true,
	},
}
