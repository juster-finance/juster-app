import { apollo } from "@/apollo"

/**
 * GQL: Queries
 */
import {
    getQuotesBySymbol,
    getQuoteByTimestamp,
    getQuoteByRange,
} from "@/graphql/queries/quotes"

export const fetchQuotesBySymbol = async ({ id, limit, offset }) => {
    try {
        if (!id || !limit)
            throw new Error(
                `${(id == undefined && "ID") ||
                    (limit == undefined && "limit")} is required`,
            )
        if (typeof id !== "number") throw new Error("ID must be a Number")
        if (typeof limit !== "number") throw new Error("Limit must be a Number")

        const { data } = await apollo.query({
            query: getQuotesBySymbol,
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
        const { data } = await apollo.query({
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
        const { data } = await apollo.query({
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
