import { apollo } from "@/apollo"

/**
 * GQL: Queries
 */
import { getUser, getUserWithdrawals } from "@/graphql/queries/users"

export const fetchUser = async ({ address }) => {
    try {
        const { data } = await apollo.query({
            query: getUser,
            variables: { address },
        })
        return data.user[0]
    } catch (error) {
        console.error(
            `Error during fetching user \n\n ${error.name}: ${error.message}`,
        )
        return {}
    }
}

export const fetchUserWithdrawals = async ({ address }) => {
    try {
        const { data } = await apollo.query({
            query: getUserWithdrawals,
            variables: { address },
        })
        return data.withdrawal
    } catch (error) {
        console.error(
            `Error during fetching user withdrawals \n\n ${error.name}: ${error.message}`,
        )
        return []
    }
}
