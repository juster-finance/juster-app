import { cloneDeep } from "lodash"

/**
 * Services
 */
import { juster } from "@/services/sdk"

/**
 * GQL: Queries
 */
import {
	getAllUserPositions,
	getUserPositionsForWithdrawal,
} from "@/graphql/queries/positions"

export const fetchAllUserPositions = async ({ address }) => {
	try {
		const { data } = await juster.apollo.query({
			query: getAllUserPositions,
			variables: { address },
		})

		return data.position
	} catch (error) {
		console.error(
			`Error during fetching all user positions \n\n ${error.name}: ${error.message}`,
		)
		return []
	}
}

export const fetchUserPositionsForWithdraw = async ({ address }) => {
	try {
		const { data } = await juster.apollo.query({
			query: getUserPositionsForWithdrawal,
			variables: { address },
		})

		return cloneDeep(data.position)
	} catch (error) {
		console.error(
			`Error during fetching user positions \n\n ${error.name}: ${error.message}`,
		)
		return []
	}
}
