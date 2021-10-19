import { apollo } from "@/apollo"

/**
 * GQL: Queries
 */
import { getBetsByEvent, getBetsByUser } from "@/graphql/queries/bets"

export const fetchBetsByEvent = async ({ eventId }) => {
    try {
        const { data } = await apollo.query({
            query: getBetsByEvent,
            variables: { eventId },
        })

        return data.bet
    } catch (error) {
        console.error(
            `Error during fetching bets by event \n\n ${error.name}: ${error.message}`,
        )
        return []
    }
}

export const fetchBetsByUser = async ({ eventId, address }) => {
    try {
        const { data } = await apollo.query({
            query: getBetsByUser,
            variables: { eventId, address },
        })

        return data.bet
    } catch (error) {
        console.error(
            `Error during fetching bets by user \n\n ${error.name}: ${error.message}`,
        )
        return []
    }
}
