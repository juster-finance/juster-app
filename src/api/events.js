/**
 * Services
 */
import { juster } from "@/services/sdk"

/**
 * GQL: Queries
 */
import {
    getAllEvents,
    getTopEvents,
    getEventById,
    getEventsByMarket,
    getEventsByStatus,
    getEventParticipants,
    getEventsWithUserPosition,
} from "@/graphql/queries/events"

export const fetchAllEvents = async () => {
    try {
        const { data } = await juster.apollo.query({
            query: getAllEvents,
        })

        return data.event
    } catch (error) {
        console.error(
            `Error during fetching all events \n\n ${error.name}: ${error.message}`,
        )
        return []
    }
}

export const fetchEventsByStatus = async ({ status }) => {
    try {
        const { data } = await juster.apollo.query({
            query: getEventsByStatus,
            variables: { status },
        })

        return data.event
    } catch (error) {
        console.error(
            `Error during fetching events by status \n\n ${error.name}: ${error.message}`,
        )
        return []
    }
}

export const fetchEventsByMarket = async ({ id, status }) => {
    try {
        const { data } = await juster.apollo.query({
            query: getEventsByMarket,
            variables: { id, status },
        })

        return data.event
    } catch (error) {
        console.error(
            `Error during fetching events by id \n\n ${error.name}: ${error.message}`,
        )
        return []
    }
}

export const fetchEventById = async ({ id }) => {
    try {
        const { data } = await juster.apollo.query({
            query: getEventById,
            variables: { id },
        })

        return data.eventByPk
    } catch (error) {
        console.error(
            `Error during fetching event by id \n\n ${error.name}: ${error.message}`,
        )
        return []
    }
}

export const fetchEventParticipants = async ({ id }) => {
    try {
        const { data } = await juster.apollo.query({
            query: getEventParticipants,
            variables: { id },
        })

        return data.event[0].positions
    } catch (error) {
        console.error(
            `Error during fetching event participant \n\n ${error.name}: ${error.message}`,
        )
        return []
    }
}

export const fetchTopEvents = async ({ limit }) => {
    try {
        const { data } = await juster.apollo.query({
            query: getTopEvents,
            variables: { limit },
        })

        return data.event
    } catch (error) {
        console.error(
            `Error during fetching top events \n\n ${error.name}: ${error.message}`,
        )
        return []
    }
}

export const fetchEventsWithUserPosition = async ({ userId }) => {
    try {
        const { data } = await juster.apollo.query({
            query: getEventsWithUserPosition,
            variables: { userId },
        })

        return data.event
    } catch (error) {
        console.error(
            `Error during fetching user positions \n\n ${error.name}: ${error.message}`,
        )
        return []
    }
}
