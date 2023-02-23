/**
 * Services
 */
import { juster } from "@sdk"

/**
 * Models
 */

import {
	quotesWma as quotesWmaModel,
	totalValueLocked as totalValueLockedModel,
} from "@/graphql/models"

export const fetchQuotesByMarket = async ({ id, limit, offset }) => {
	try {
		if (!id || !limit)
			throw new Error(
				`${
					(id == undefined && "ID") || (limit == undefined && "limit")
				} is required`,
			)
		if (typeof id !== "number") throw new Error("ID must be a Number")
		if (typeof limit !== "number") throw new Error("Limit must be a Number")

		const { quotesWma } = await juster.gql.query({
			quotesWma: [
				{
					where: {
						currencyPairId: {
							_eq: id,
						},
					},
					order_by: {
						timestamp: "desc",
					},
					limit: limit,
					offset: offset,
				},
				quotesWmaModel,
			],
		})
		return quotesWma
	} catch (error) {
		console.error(
			`Error during fetching quotes by id \n\n ${error.name}: ${error.message}`,
		)
		return []
	}
}

export const fetchQuoteByRange = async ({ id, tsGt, tsLt }) => {
	try {
		const { quotesWma } = await juster.gql.query({
			quotesWma: [
				{
					where: {
						timestamp: { _gte: tsGt, _lte: tsLt },
						currencyPairId: { _eq: id },
					},
					order_by: { timestamp: "desc" },
				},
				quotesWmaModel,
			],
		})

		return quotesWma
	} catch (error) {
		console.error(
			`Error during fetching quote by range ts & id \n\n ${error.name}: ${error.message}`,
		)
		return []
	}
}

export const fetchQuoteByTimestamp = async ({ id, ts }) => {
	try {
		const { quotesWma } = await juster.gql.query({
			quotesWma: [
				{
					where: {
						currencyPairId: { _eq: id },
						timestamp: { _eq: ts },
					},
					order_by: { timestamp: "desc" },
					limit: 1,
				},
				quotesWmaModel,
			],
		})

		return quotesWma
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
		const { totalValueLocked } = await juster.gql.query({
			totalValueLockedModel: [
				{
					where: { eventId: { _eq: id } },
				},
				totalValueLockedModel,
			],
		})

		return totalValueLocked
	} catch (error) {
		console.error(
			`Error during fetching tvl by event id \n\n ${error.name}: ${error.message}`,
		)
		return []
	}
}
