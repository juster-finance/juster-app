import { apollo } from "@/apollo"

/**
 * GQL: Queries
 */
import {
    getUser,
    getUserWithdrawals,
    getTopBettors,
    getTopLiquidityProviders,
} from "@/graphql/queries/users"

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

export const fetchTopLiquidityProviders = async () => {
    try {
        const { data } = await apollo.query({
            query: getTopLiquidityProviders,
        })
        return data.user
    } catch (error) {
        console.error(
            `Error during fetching top liquidity providers \n\n ${error.name}: ${error.message}`,
        )
        return []
    }
}

export const fetchTopBettors = async () => {
    try {
        const { data } = await apollo.query({
            query: getTopBettors,
        })
        return data.user
    } catch (error) {
        console.error(
            `Error during fetching top bettors \n\n ${error.name}: ${error.message}`,
        )
        return []
    }
}
