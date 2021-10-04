import { apollo } from "@/apollo"

/**
 * GQL: Queries
 */
import { getBetsByEvent, getBetsByUser } from "@/graphql/queries/bets"

export const fetchBetsByEvent = async ({ event_id }) => {
    try {
        const { data } = await apollo.query({
            query: getBetsByEvent,
            variables: { event_id },
        })

        return data.juster_bet
    } catch (error) {
        console.error(
            `Error during fetching bets by event \n\n ${error.name}: ${error.message}`,
        )
        return []
    }
}

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
