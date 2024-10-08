import { ref } from "vue"
import { juster, destroySubscription, executeGqlQuery, currentNetwork } from "@sdk"
import { 
    event as eventModel, 
    position as positionModel
} from "@/graphql/models"
import { toGqlParams, getMinMaxGql } from "@/services/utils/graphql"
import { verifiedMakers } from "@config"

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
    const totalCount = ref(0)

    const start = async ({ userId, pageNumber, pageSize }) => {
        const filter = {
            userId: {
                _eq: userId,
            },
        }

        subToPositions.value = await juster.gql
	    	.subscription({
                position: [
                    {
                        where: filter,
                        order_by: {
                            id: "desc",
                        },
                        limit: pageSize,
                        offset: pageSize * (pageNumber - 1),
                    },
                    positionModel,
                ]
	    	})
	    	.subscribe({
                next: async ({ position: positions }) => {
	    			events.value = positions.map((position) => position.event)
                    const where = toGqlParams(filter)
                    const result = await executeGqlQuery(`
                        query {
                            positionAggregate(where: ${where})  {
                                aggregate {
                                    count
                                }
                            }
                        }
                    `)

                    totalCount.value = result.positionAggregate.aggregate.count
	    		},
	    		error: console.error,
	    	})
    }

    const stop = () => {
        destroySubscription(subToPositions.value)
    }

    return { events, totalCount, start, stop }
}

export const useFilteredEvents = () => {
    const subToEvents = ref({})
    const events = ref([])
    const totalCount = ref(0)

    const start = async ({
        currencyPairId,  
        symbols,
        minLiquidity,
        maxLiquidity,
        statuses,
        periods,
        minBetsCloseDate,
        maxBetsCloseDate,
        participants,
        pageNumber, 
        pageSize,
        createdByJuster,
        createdByOthers,
        customTargetDynamics,
        moreThanTwoParticipants
    } = {}) => {

        const totalLiquidityProvided = getMinMaxGql(minLiquidity, maxLiquidity)
        
        const minBetsCloseDateString = minBetsCloseDate ? minBetsCloseDate.toISO() : undefined
        const maxBetsCloseDateString = maxBetsCloseDate ? maxBetsCloseDate.toISO() : undefined
        const betsCloseTime = getMinMaxGql(minBetsCloseDateString, maxBetsCloseDateString)

        const justerAddress = verifiedMakers[currentNetwork.value];
        const creatorId = createdByJuster && createdByOthers || createdByJuster === undefined && createdByOthers === undefined 
            ? undefined
            : createdByJuster
                ? { _in: justerAddress }
                : { _nin: justerAddress }

        const targetDynamics = customTargetDynamics == undefined 
            ? undefined
            : customTargetDynamics 
                ? { _neq: 1 } 
                : { _eq: 1 }

        const filter = {
            currencyPairId: currencyPairId !== undefined ? { _eq: currencyPairId } : undefined,
            status: statuses !== undefined ? { _in: statuses } : undefined,
            measurePeriod: periods !== undefined ? { _in: periods } : undefined,
            totalLiquidityProvided,
            betsCloseTime,
            currencyPair: symbols !== undefined ? { symbol: {_in: symbols} } : undefined,
            creatorId,
            targetDynamics,
            participantsCount: moreThanTwoParticipants ? { _gt: 2 } : undefined,
            _or: [{
                bets: participants?.length ? { userId: {_in: participants } } : undefined,
            }, {
                deposits: participants?.length ? { userId: {_in: participants } } : undefined,
            }]
        }

        subToEvents.value = await juster.gql
	    	.subscription({
                event: [
                    {
                        where: filter,
                        order_by: { createdTime: "desc" },
                        limit: pageSize,
                        offset: pageSize * (pageNumber - 1),
                    },
                    eventModel,
                ],
	    	})
	    	.subscribe({
	    		next: async ({ event: rawEvents }) => {
	    			events.value = rawEvents
                    const where = toGqlParams(filter)

                    const result = await executeGqlQuery(`
                        query {
                            eventAggregate(where: ${where})  {
                                aggregate {
                                    count
                                }
                            }
                        }
                    `)

                    totalCount.value = result.eventAggregate.aggregate.count
	    		},
	    		error: console.error,
	    	})
    }

    const stop = () => {
        destroySubscription(subToEvents.value)
    }

    return { events, totalCount, start, stop }
}

export const useTotalEventsCount = () => {
    const subToEvents = ref({})
    const totalCount = ref(0)

    const start = async () => {
        subToEvents.value = await juster.gql
	    	.subscription({
                event: [
                    {
                        
                        order_by: { id: "desc" },
                        limit: 1,
                    },
                    {
                        id: true
                    } 
                ],
	    	})
	    	.subscribe({
	    		next: async () => {
	    			const result = await executeGqlQuery(`
                        query {
                            eventAggregate {
                                aggregate {
                                    count
                                }
                            }
                        }
                    `)
                    totalCount.value = result.eventAggregate.aggregate.count
	    		},
	    		error: console.error,
	    	})
    }

    const stop = () => {
        destroySubscription(subToEvents.value)
    }

    return { totalCount, start, stop }
}
