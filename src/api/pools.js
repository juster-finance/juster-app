/**
 * Services
 */
import { juster } from "@sdk"

/**
 * GQL: Models
 */
import {
	pool as poolModel,
	poolState as poolStateModel,
} from "@/graphql/models"

export const fetchAllPools = async () => {
	try {
		const { pool } = await juster.gql.query({
			pool: poolModel,
		})
		return pool
	} catch (error) {
		console.error(
			`Error during fetching pools \n\n ${error.name}: ${error.message}`,
		)
		return {}
	}
}

export const fetchPoolStateByRange = async ({ poolId, tsGt, tsLt }) => {
	try {
		const { poolState } = await juster.gql.query({
			poolState: [
				{
					where: {
						poolId: {
							_eq: poolId,
						},
						timestamp: {
							_gt: tsGt,
							_lt: tsLt,
						},
					},
				},
				poolStateModel,
			],
		})
		return poolState
	} catch (error) {
		console.error(
			`Error during fetching pool state \n\n ${error.name}: ${error.message}`,
		)
		return {}
	}
}
