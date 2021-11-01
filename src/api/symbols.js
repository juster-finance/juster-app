import { apollo } from "@/apollo"

/**
 * GQL: Queries
 */
import { getSymbols, getSymbolById } from "@/graphql/queries/symbols"

export const fetchSymbols = async () => {
    try {
        const { data } = await apollo.query({ query: getSymbols })
        return data.currencyPair
    } catch (error) {
        console.error(
            `Error during fetching symbols \n\n ${error.name}: ${error.message}`,
        )
        return []
    }
}

export const fetchSymbolById = async ({ id }) => {
    try {
        if (!id) throw new Error("ID is required")
        if (typeof id !== "number") throw new Error("ID must be a Number")

        const { data } = await apollo.query({
            query: getSymbolById,
            variables: { id: id },
        })
        return data.currencyPairByPk
    } catch (error) {
        console.error(
            `Error during fetching symbol by id \n\n ${error.name}: ${error.message}`,
        )
        return []
    }
}
