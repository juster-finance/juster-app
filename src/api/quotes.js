/**
 * Services
 */
import { juster } from "@/services/sdk"

/**
 * GQL: Queries
 */
import {
    getQuotesByMarket,
    getQuoteByTimestamp,
    getQuoteByRange,
    getTVLByEventId,
} from "@/graphql/queries/quotes"

export const fetchQuotesByMarket = async ({ id, limit, offset }) => {
    try {
        if (!id || !limit)
            throw new Error(
                `${(id == undefined && "ID") ||
                    (limit == undefined && "limit")} is required`,
            )
        if (typeof id !== "number") throw new Error("ID must be a Number")
        if (typeof limit !== "number") throw new Error("Limit must be a Number")

        const { data } = await juster.apollo.query({
            query: getQuotesByMarket,
            variables: { id, limit, offset },
        })
        return data.quotesWma
    } catch (error) {
        console.error(
            `Error during fetching quotes by id \n\n ${error.name}: ${error.message}`,
        )
        return []
    }
}

export const fetchQuoteByRange = async ({ id, tsGt, tsLt }) => {
    try {
        const { data } = await juster.apollo.query({
            query: getQuoteByRange,
            variables: { id, tsGt, tsLt },
        })

        return data.quotesWma
    } catch (error) {
        console.error(
            `Error during fetching quote by range ts & id \n\n ${error.name}: ${error.message}`,
        )
        return []
    }
}

export const fetchQuoteByTimestamp = async ({ id, ts }) => {
    try {
        const { data } = await juster.apollo.query({
            query: getQuoteByTimestamp,
            variables: { id, ts },
        })

        return data.quotesWma
    } catch (error) {
        console.error(
            `Error during fetching quote by ts & id \n\n ${error.name}: ${error.message}`,
        )
        return []
    }
}

/** TVL */
export const fetchEventTVL = async ({ id }) => {
    try {
        const { data } = await juster.apollo.query({
            query: getTVLByEventId,
            variables: { id },
        })

        return data.totalValueLocked
    } catch (error) {
        console.error(
            `Error during fetching tvl by event id \n\n ${error.name}: ${error.message}`,
        )
        return []
    }
}
