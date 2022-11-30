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
	pool: {
		name: true,
	},
}
