import { apollo } from "@/apollo"

/**
 * GQL: Queries
 */
import { getBetsByUser } from "@/graphql/queries/bets"

export const fetchBetsByUser = async ({ event_id, address }) => {
    try {
        const { data } = await apollo.query({
            query: getBetsByUser,
            variables: { event_id, address },
        })

        return data.juster_bet
    } catch (error) {
        console.error(
            `Error during fetching bets by user \n\n ${error.name}: ${error.message}`,
        )
        return []
    }
}
