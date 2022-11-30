/**
 * Services
 */
import { juster } from "@sdk"

/**
 * Models>
 */
import { deposit as depositModel } from "@/graphql/models"

export const fetchDepositsByEvent = async ({ eventId }) => {
	try {
		const { deposit } = await juster.gql.query({
			deposit: [
				{
					where: {
						eventId: {
							_eq: eventId,
						},
					},
				},
				depositModel,
			],
		})

		return deposit
	} catch (error) {
		console.error(
			`Error during fetching deposits by event \n\n ${error.name}: ${error.message}`,
		)
		return []
	}
}
