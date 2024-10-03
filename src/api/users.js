/**
 * Services
 */
import { juster } from "@sdk"
import { toUserFriendlyAddress } from "@utils/address"

/**
 * Models
 */
import {
	user as userModel,
	miniUser as miniUserModel,
	userWithdrawal as userWithdrawalModel,
	userWithBets as userWithBetsModel,
	userWithReward as userWithRewardModel,
} from "@/graphql/models"

export const fetchUser = async ({ address }) => {
	try {
		const { user } = await juster.gql.query({
			user: [
				{
					where: { address: { _eq: address } },
				},
				userModel,
			],
		})
		return user[0]
	} catch (error) {
		console.error(
			`Error during fetching user \n\n ${error.name}: ${error.message}`,
		)
		return {}
	}
}

export const fetchAllUsers = async () => {
	try {
		const { user } = await juster.gql.query({
			user: miniUserModel,
		})
		return user
	} catch (error) {
		console.error(
			`Error during fetching all users \n\n ${error.name}: ${error.message}`,
		)
		return {}
	}
}

export const fetchUserWithdrawals = async ({ address }) => {
	try {
		const { withdrawal } = await juster.gql.query({
			withdrawal: [
				{
					where: { userId: { _eq: address } },
					order_by: { id: "desc" },
				},
				userWithdrawalModel,
			],
		})

		return withdrawal
	} catch (error) {
		console.error(
			`Error during fetching user withdrawals \n\n ${error.name}: ${error.message}`,
		)
		return []
	}
}

export const fetchUserWithdrawalByEvent = async ({ address, eventId }) => {
	try {
		const { withdrawal } = await juster.gql.query({
			withdrawal: [
				{
					where: { 
						userId: { _eq: address },
						event: { id: { _eq: eventId } },
					},
					order_by: { id: "desc" },
				},
				userWithdrawalModel,
			],
		})

		return withdrawal[0]
	} catch (error) {
		console.error(
			`Error during fetching user withdrawals by event \n\n ${error.name}: ${error.message}`,
		)
		return []
	}
}

export const fetchTopLiquidityProviders = async () => {
	try {
		const { user } = await juster.gql.query({
			user: [
				{ order_by: { totalProviderReward: "desc" }, limit: 5 },
				userWithRewardModel,
			],
		})
		return user.map((user) => 
			({
				...user,
				userFriendlyAddress: toUserFriendlyAddress(user.address),
			})
		)
	} catch (error) {
		console.error(
			`Error during fetching top liquidity providers \n\n ${error.name}: ${error.message}`,
		)
		return []
	}
}

export const fetchTopBettors = async () => {
	try {
		const { user } = await juster.gql.query({
			user: [
				{
					order_by: { totalBetsCount: "desc" },
					limit: 5,
				},
				userWithBetsModel,
			],
		})
		return user.map((user) => 
			({
				...user,
				userFriendlyAddress: toUserFriendlyAddress(user.address),
			})
		)
	} catch (error) {
		console.error(
			`Error during fetching top bettors \n\n ${error.name}: ${error.message}`,
		)
		return []
	}
}
