export const pool = {
	name: true,
	version: true,
	address: true,
	isDepositPaused: true,
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
