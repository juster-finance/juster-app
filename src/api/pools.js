/**
 * Services
 */
import { juster } from "@sdk"

/**
 * GQL: Models
 */
import { pool as poolModel } from "@/graphql/models"

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
