/**
 * Services
 */
import { juster } from "@sdk"

/**
 * Models
 */
import { market as marketModel } from "@/graphql/models"

export const fetchMarkets = async () => {
	try {
		const { currencyPair } = await juster.gql.query({
			currencyPair: marketModel,
		})
		return currencyPair
	} catch (error) {
		console.error(
			`Error during fetching markets \n\n ${error.name}: ${error.message}`,
		)
		return []
	}
}
