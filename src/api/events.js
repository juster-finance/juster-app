/**
 * Services
 */
import { juster } from "@sdk"

/**
 * Models
 */
import { event as eventModel } from "@/graphql/models"

export const fetchAllEvents = async () => {
	try {
		const { event } = await juster.gql.query({
			event: [
				{
					order_by: { createdTime: "desc" },
				},
				eventModel,
			],
		})

		return event
	} catch (error) {
		console.error(
			`Error during fetching all events \n\n ${error.name}: ${error.message}`,
		)
		return []
	}
}

export const fetchEventsByStatus = async ({ status }) => {
	try {
		const { event } = await juster.gql.query({
			event: [
				{
					where: { status: { _in: status } },
				},
				eventModel,
			],
		})

		return event
	} catch (error) {
		console.error(
			`Error during fetching events by status \n\n ${error.name}: ${error.message}`,
		)
		return []
	}
}

export const fetchEventsByMarket = async ({ id, status }) => {
	try {
		const { event } = await juster.gql.query({
			event: [
				{
					where: {
						currencyPairId: { _eq: id },
						status: { _eq: status },
					},
					order_by: { createdTime: "desc" },
				},
				eventModel,
			],
		})

		return event
	} catch (error) {
		console.error(
			`Error during fetching events by id \n\n ${error.name}: ${error.message}`,
		)
		return []
	}
}

export const fetchEventById = async ({ id }) => {
	try {
		const { eventByPk } = await juster.gql.query({
			eventByPk: [
				{
					id,
				},
				eventModel,
			],
		})

		return eventByPk
	} catch (error) {
		console.error(
			`Error during fetching event by id \n\n ${error.name}: ${error.message}`,
		)
		return []
	}
}

export const fetchEventParticipants = async ({ id }) => {
	try {
		const { event } = await juster.gql.query({
			event: [
				{
					where: { id: { _eq: id } },
				},
				{
					positions: {
						userId: true,
						liquidityProvidedAboveEq: true,
						liquidityProvidedBelow: true,
						rewardAboveEq: true,
						rewardBelow: true,
						eventId: true,
						shares: true,
					},
				},
			],
		})

		return event[0].positions
	} catch (error) {
		console.error(
			`Error during fetching event participant \n\n ${error.name}: ${error.message}`,
		)
		return []
	}
}

export const fetchTopEvents = async ({ limit }) => {
	try {
		const { event } = await juster.gql.query({
			event: [
				{
					where: { status: { _eq: "NEW" } },
					order_by: { id: "desc" },
					limit,
				},
				eventModel,
			],
		})

		return event
	} catch (error) {
		console.error(
			`Error during fetching top events \n\n ${error.name}: ${error.message}`,
		)
		return []
	}
}

export const fetchEventsWithUserPosition = async ({ userId }) => {
	try {
		const { event } = await juster.gql.query({
			event: [
				{
					where: {
						bets: { userId: { _eq: userId } },
						status: { _in: ["NEW", "STARTED"] },
					},
				},
				eventModel,
			],
		})

		return event
	} catch (error) {
		console.error(
			`Error during fetching user positions \n\n ${error.name}: ${error.message}`,
		)
		return []
	}
}
