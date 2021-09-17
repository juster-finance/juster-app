import { ref, reactive } from "vue"
import { DateTime } from "luxon"
import { gql } from "@/services/tools"

/**
 * Services
 */
import { supportedSymbols } from "@/services/config"

/**
 * API
 */
import { fetchSymbols } from "@/api/symbols"
import { fetchQuotesBySymbol, fetchQuoteByTimestamp } from "@/api/quotes"

/**
 * Store
 */
import { useMarketStore } from "@/store/market"

export const useMarket = () => {
    const marketStore = useMarketStore()

    const status = ref("Initialization")
    const symbols = reactive([])

    const setupMarket = async () => {
        status.value = "Fetching symbols"
        const allSymbols = await fetchSymbols()

        /** only available */
        symbols.value = allSymbols.filter(
            symbol => supportedSymbols[symbol.symbol],
        )

        symbols.value.forEach(symbol => {
            marketStore.setSymbol({ target: symbol.symbol, symbol })
        })
        marketStore.isSymbolsLoaded = true

        /** quotes */
        status.value = "Fetching quotes"

        const prevWeekDt = DateTime.now()
            .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
            .minus({ day: 7 })
            .toISO()

        symbols.value.forEach(async symbol => {
            const quotes = await fetchQuotesBySymbol({
                id: symbol.id,
                ts: DateTime.now().toISO(),
                limit: 100,
            })
            marketStore.setQuotes({ target: symbol.symbol, quotes })

            /** weekly diff */
            const historyQuote = await fetchQuoteByTimestamp({
                id: symbol.id,
                ts: prevWeekDt,
            })
            marketStore.setHistoryPrice({
                target: symbol.symbol,
                price: historyQuote[0] ? historyQuote[0].price : 0,
            })

            /** subscription */
            gql.subscription({
                juster_quotes_wma: [
                    {
                        where: {
                            currency_pair_id: { _eq: symbol.id },
                        },
                        order_by: { timestamp: "desc" },
                        limit: 1,
                    },
                    {
                        currency_pair_id: true,
                        price: true,
                        timestamp: true,
                    },
                ],
            }).subscribe({
                next: data => {
                    const quote = data.juster_quotes_wma[0]
                    marketStore.updateQuotes({
                        target: symbol.symbol,
                        quote,
                    })
                },
                error: console.error,
            })
        })
    }

    return { setupMarket, symbols }
}
