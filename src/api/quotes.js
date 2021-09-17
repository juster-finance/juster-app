import { apollo } from "@/apollo"

/**
 * GQL: Queries
 */
import {
    getQuotesBySymbol,
    getQuoteByTimestamp,
} from "@/graphql/queries/quotes"

export const fetchQuotesBySymbol = async ({ id, ts, limit }) => {
    try {
        if (!id || !ts || !limit)
            throw new Error(
                `${(id == undefined && "ID") ||
                    (ts == undefined && "TS (timestamp)") ||
                    (limit == undefined && "limit")} is required`,
            )
        if (typeof id !== "number") throw new Error("ID must be a Number")
        if (typeof limit !== "number") throw new Error("Limit must be a Number")

        const { data } = await apollo.query({
            query: getQuotesBySymbol,
            variables: { id, ts, limit },
        })
        return data.juster_quotes_wma
    } catch (error) {
        console.error(
            `Error during fetching quotes by id \n\n ${error.name}: ${error.message}`,
        )
        return []
    }
}

export const fetchQuoteByTimestamp = async ({ id, ts }) => {
    try {
        const { data } = await apollo.query({
            query: getQuoteByTimestamp,
            variables: { id, ts },
        })

        return data.juster_quotes_wma
    } catch (error) {
        console.error(
            `Error during fetching quote by ts & id \n\n ${error.name}: ${error.message}`,
        )
        return []
    }
}
