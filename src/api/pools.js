/**
 * Services
 */
import { juster } from "@sdk"

/**
 * GQL: Queries
 */
import { getAllPools } from "@/graphql/queries/pools"

export const fetchAllPools = async () => {
	try {
		const { data } = await juster.apollo.query({
			query: getAllPools,
		})
		return data.pool
	} catch (error) {
		console.error(
			`Error during fetching pools \n\n ${error.name}: ${error.message}`,
		)
		return {}
	}
}
