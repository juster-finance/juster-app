import { apollo } from "@/apollo"

/**
 * GQL: Queries
 */
import {
    getAllEvents,
    getTopEvents,
    getEventById,
    getEventsBySymbol,
    getEventParticipants,
} from "@/graphql/queries/events"

export const fetchAllEvents = async ({ status }) => {
    try {
        const { data } = await apollo.query({
            query: getAllEvents,
            variables: { status },
        })

        return data.juster_event
    } catch (error) {
        console.error(
            `Error during fetching all events \n\n ${error.name}: ${error.message}`,
        )
        return []
    }
}

export const fetchEventsBySymbol = async ({ id, status }) => {
    try {
        const { data } = await apollo.query({
            query: getEventsBySymbol,
            variables: { id, status },
        })

        return data.juster_event
    } catch (error) {
        console.error(
            `Error during fetching events by id \n\n ${error.name}: ${error.message}`,
        )
        return []
    }
}

export const fetchEventById = async ({ id }) => {
    try {
        const { data } = await apollo.query({
            query: getEventById,
            variables: { id },
        })

        return data.juster_event_by_pk
    } catch (error) {
        console.error(
            `Error during fetching event by id \n\n ${error.name}: ${error.message}`,
        )
        return []
    }
}

export const fetchEventParticipants = async ({ id }) => {
    try {
        const { data } = await apollo.query({
            query: getEventParticipants,
            variables: { id },
        })

        return data.juster_event[0].positions
    } catch (error) {
        console.error(
            `Error during fetching event participant \n\n ${error.name}: ${error.message}`,
        )
        return []
    }
}

export const fetchTopEvents = async () => {
    try {
        const { data } = await apollo.query({
            query: getTopEvents,
        })

        return data.juster_event
    } catch (error) {
        console.error(
            `Error during fetching top events \n\n ${error.name}: ${error.message}`,
        )
        return []
    }
}
