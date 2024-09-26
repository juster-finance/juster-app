import { ref } from "vue"
import { juster, destroySubscription } from "@sdk"
import { event as eventModel } from "@/graphql/models/events"

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
