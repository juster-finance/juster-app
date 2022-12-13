export const pool = {
	name: true,
	version: true,
	address: true,
	isDepositPaused: true,
	entryLockPeriod: true,
}

export const poolPosition = {
	id: true,
	poolId: true,
	depositedAmount: true,
	lockedEstimateAmount: true,
	shares: true,
	entrySharePrice: true,
	claims: {
		amount: true,
		id: true,
		withdrawn: true,
		eventId: true,
		poolId: true,
		event: {
			result: true,
			event: {
				betsCloseTime: true,
				measurePeriod: true,
			},
		},
	},
	pool: {
		name: true,
	},
}

export const claim = {
	id: true,
	amount: true,
	withdrawn: true,
	eventId: true,
	poolId: true,
	event: {
		result: true,
	},
}

export const entryLiquidity = {
	acceptTime: true,
	amount: true,
	poolId: true,
	poolEntryId: true,
	entryId: true,
	status: true,
	pool: {
		name: true,
	},
}

export const poolState = {
	id: true,
	level: true,
	action: true,
	counter: true,
	poolId: true,
	activeLiquidity: true,
	entryLiquidity: true,
	opgHash: true,
	sharePrice: true,
	timestamp: true,
	totalLiquidity: true,
	totalShares: true,
	withdrawableLiquidity: true,
}
