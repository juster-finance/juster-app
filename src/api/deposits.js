/**
 * Services
 */
import { juster } from "@/services/sdk"

/**
 * GQL: Queries
 */
import { getDepositsByEvent } from "@/graphql/queries/deposits"

export const fetchDepositsByEvent = async ({ eventId }) => {
    try {
        const { data } = await juster.apollo.query({
            query: getDepositsByEvent,
            variables: { eventId },
        })

        return data.deposit
    } catch (error) {
        console.error(
            `Error during fetching deposits by event \n\n ${error.name}: ${error.message}`,
        )
        return []
    }
}
