export const user = {
	totalBetsAmount: true,
	totalBetsCount: true,
	totalFeesCollected: true,
	totalLiquidityProvided: true,
	totalProviderReward: true,
	totalReward: true,
	totalWithdrawn: true,
}

export const miniUser = {
	address: true,
}

export const userWithBets = {
	address: true,
	totalBetsCount: true,
}

export const userWithReward = {
	address: true,
	totalProviderReward: true,
}

export const userWithdrawal = {
	id: true,
	amount: true,
	createdTime: true,
	event: {
		id: true,
		closedOracleTime: true,
	},
	feeCollectorId: true,
	type: true,
	opgHash: true,
	userId: true,
}
