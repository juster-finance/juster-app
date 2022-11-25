/**
 * Services
 */
import { juster } from "@sdk"

/**
 * GQL: Queries
 */
import {
	getUser,
	getAllUsers,
	getUserWithdrawals,
	getTopBettors,
	getTopLiquidityProviders,
} from "@/graphql/queries/users"

export const fetchUser = async ({ address }) => {
	try {
		const { data } = await juster.apollo.query({
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

export const fetchAllUsers = async () => {
	try {
		const { data } = await juster.apollo.query({
			query: getAllUsers,
		})
		return data.user
	} catch (error) {
		console.error(
			`Error during fetching all users \n\n ${error.name}: ${error.message}`,
		)
		return {}
	}
}

export const fetchUserWithdrawals = async ({ address }) => {
	try {
		const { data } = await juster.apollo.query({
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
		const { data } = await juster.apollo.query({
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
		const { data } = await juster.apollo.query({
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
