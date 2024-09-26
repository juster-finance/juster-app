import { ref } from "vue"
import { juster, destroySubscription } from "@sdk"
import { 
    event as eventModel, 
    position as positionModel
} from "@/graphql/models"

export const useTopNEvents = (count) => {
    const subToTopEvents = ref({})
    const topEvents = ref([])

    const start = async () => {
        subToTopEvents.value = await juster.gql
	    	.subscription({
	    		event: [
	    			{
	    				where: { status: { _eq: "NEW" } },
	    				order_by: [{ bets_aggregate: {count: "desc"}}, {id: "desc"}],
	    				limit: count,
	    			},
	    			eventModel,
	    		],
	    	})
	    	.subscribe({
	    		next: ({ event: rawTopEvents }) => {
	    			topEvents.value = rawTopEvents
	    		},
	    		error: console.error,
	    	})
    }

    const stop = () => {
        destroySubscription(subToTopEvents.value)
    }

    return { topEvents, start, stop }
}


export const useParticipatedEvents = () => {
    const subToPositions = ref({})
    const events = ref([])

    const start = async (userId) => {
        subToPositions.value = await juster.gql
	    	.subscription({
                position: [
                    {
                        where: {
                            userId: {
                                _eq: userId,
                            },
                        },
                        order_by: {
                            id: "desc",
                        },
                    },
                    positionModel,
                ],
	    	})
	    	.subscribe({
	    		next: ({ position: positions }) => {
	    			events.value = positions.map((position) => position.event)
	    		},
	    		error: console.error,
	    	})
    }

    const stop = () => {
        destroySubscription(subToPositions.value)
    }

    return { events, start, stop }
}


export const useFilteredEvents = () => {
    const subToEvents = ref({})
    const events = ref([])

    const start = async (currencyPairId, status) => {
        subToEvents.value = await juster.gql
	    	.subscription({
                event: [
                    {
                        where: {
                            currencyPairId: currencyPairId ? { _eq: currencyPairId } : undefined,
                            status: { _eq: status },
                        },
                        order_by: { createdTime: "desc" },
                    },
                    eventModel,
                ],
	    	})
	    	.subscribe({
	    		next: ({ event: rawEvents }) => {
	    			events.value = rawEvents
	    		},
	    		error: console.error,
	    	})
    }

    const stop = () => {
        destroySubscription(subToEvents.value)
    }

    return { events, start, stop }
}
