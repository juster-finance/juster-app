import { apollo } from "@/apollo"

/**
 * GQL: Queries
 */
import { getDepositsByEvent } from "@/graphql/queries/deposits"

export const fetchDepositsByEvent = async ({ event_id }) => {
    try {
        const { data } = await apollo.query({
            query: getDepositsByEvent,
            variables: { event_id },
        })

        return data.juster_deposit
    } catch (error) {
        console.error(
            `Error during fetching deposits by event \n\n ${error.name}: ${error.message}`,
        )
        return []
    }
}
