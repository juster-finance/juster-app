import cloneDeep from "lodash.clonedeep"

/**
 * Services
 */
import { juster } from "@sdk"

/**
 * Models
 */
import { position as positionModel } from "@/graphql/models"

export const fetchAllUserPositions = async ({ address }) => {
	try {
		const { position } = await juster.gql.query({
			position: [
				{
					where: {
						userId: {
							_eq: address,
						},
					},
					order_by: {
						id: "desc",
					},
				},
				positionModel,
			],
		})

		return position
	} catch (error) {
		console.error(
			`Error during fetching all user positions \n\n ${error.name}: ${error.message}`,
		)
		return []
	}
}

export const fetchUserPositionsForWithdraw = async ({ address }) => {
	try {
		const { position } = await juster.gql.query({
			position: [
				{
					where: {
						userId: {
							_eq: address,
						},
						withdrawn: { _eq: false },
						value: { _neq: 0 },
						event: { status: { _eq: "FINISHED" } },
					},
					order_by: {
						id: "desc",
					},
				},
				positionModel,
			],
		})

		return cloneDeep(position)
	} catch (error) {
		console.error(
			`Error during fetching user positions \n\n ${error.name}: ${error.message}`,
		)
		return []
	}
}

export const fetchUserPositionsForWithdrawByEvent = async ({ address, eventId }) => {
	try {
		const { position } = await juster.gql.query({
			position: [
				{
					where: {
						userId: {
							_eq: address,
						},
						withdrawn: { _eq: false },
						value: { _neq: 0 },
						event: { id: { _eq: eventId } },
					},
					order_by: {
						id: "desc",
					},
				},
				positionModel,
			],
		})

		return cloneDeep(position)
	} catch (error) {
		console.error(
			`Error during fetching user positions by event \n\n ${error.name}: ${error.message}`,
		)
		return []
	}
}
