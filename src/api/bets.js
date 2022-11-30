/**
 * Services
 */
import { juster } from "@sdk"

/**
 * Models
 */
import { bet as betModel } from "@/graphql/models"

export const fetchBetsByEvent = async ({ eventId }) => {
	try {
		const { bet } = await juster.gql.query({
			bet: [
				{
					where: {
						eventId: {
							_eq: eventId,
						},
					},
				},
				betModel,
			],
		})

		return bet
	} catch (error) {
		console.error(
			`Error during fetching bets by event \n\n ${error.name}: ${error.message}`,
		)
		return []
	}
}

export const fetchBetsByUser = async ({ eventId, address }) => {
	try {
		const { bet } = await juster.gql.query({
			bet: [
				{
					where: {
						eventId: {
							_eq: eventId,
						},
						userId: {
							_eq: address,
						},
					},
				},
				betModel,
			],
		})

		return bet
	} catch (error) {
		console.error(
			`Error during fetching bets by user \n\n ${error.name}: ${error.message}`,
		)
		return []
	}
}
