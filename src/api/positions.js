import { apollo } from "@/apollo"

/**
 * GQL: Queries
 */
import {
    getAllUserPositions,
    getUserPositionsForWithdrawal,
} from "@/graphql/queries/positions"

export const fetchAllUserPositions = async ({ address }) => {
    try {
        const { data } = await apollo.query({
            query: getAllUserPositions,
            variables: { address },
        })

        return data.juster_position
    } catch (error) {
        console.error(
            `Error during fetching all user positions \n\n ${error.name}: ${error.message}`,
        )
        return []
    }
}

export const fetchUserPositionsForWithdrawal = async ({ address }) => {
    try {
        const { data } = await apollo.query({
            query: getUserPositionsForWithdrawal,
            variables: { address },
        })

        return data.juster_position
    } catch (error) {
        console.error(
            `Error during fetching user positions \n\n ${error.name}: ${error.message}`,
        )
        return []
    }
}
