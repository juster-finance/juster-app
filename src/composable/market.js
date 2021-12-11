import { reactive } from "vue"
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
import { fetchUserPositionsForWithdraw } from "@/api/positions"

/**
 * Store
 */
import { useMarketStore } from "@/store/market"
import { useAccountStore } from "@/store/account"

/**
 * gql
 */
import { position } from "@/graphql/models"

export const useMarket = () => {
    const marketStore = useMarketStore()
    const accountStore = useAccountStore()

    const symbols = reactive([])

    const setupUser = async () => {
        /** All positions for withdraw */
        const userPositions = await fetchUserPositionsForWithdraw({
            address: accountStore.pkh,
        })
        if (userPositions.length) {
            accountStore.positionsForWithdrawal = userPositions
            accountStore.isPositionsLoading = false
        }

        /**
         * Subscriptions
         */

        /** New Positions */
        gql.subscription({
            position: [
                {
                    where: {
                        userId: {
                            _eq: accountStore.pkh,
                        },
                        withdrawn: { _eq: false },
                        event: { status: { _eq: "FINISHED" } },
                    },
                },
                {
                    ...position,
                },
            ],
        }).subscribe({
            next: data => {
                const newPositions = data.position

                newPositions.forEach(newPosition => {
                    if (
                        accountStore.positionsForWithdrawal.some(
                            position => position.id == newPosition.id,
                        )
                    )
                        return

                    accountStore.positionsForWithdrawal.push(newPosition)
                })
            },
            error: console.error,
        })

        /** Newly withdrawn positions */
        gql.subscription({
            position: [
                {
                    where: {
                        userId: { _eq: accountStore.pkh },
                        withdrawn: { _eq: true },
                        event: { status: { _eq: "FINISHED" } },
                    },
                },
                {
                    ...position,
                },
            ],
        }).subscribe({
            next: data => {
                const { position: withdrawnPositions } = data

                const positionsIdsForWithdrawal = accountStore.positionsForWithdrawal.map(
                    pos => pos.id,
                )
                withdrawnPositions.forEach(withdrawnPosition => {
                    if (
                        positionsIdsForWithdrawal.includes(withdrawnPosition.id)
                    ) {
                        accountStore.removePosition(withdrawnPosition.id)
                    }
                })
            },
            error: console.error,
        })
    }

    const setupMarket = async () => {
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
        const prevWeekDt = DateTime.now()
            .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
            .minus({ day: 7 })
            .toISO()

        symbols.value.forEach(async symbol => {
            const quotes = await fetchQuotesBySymbol({
                id: symbol.id,
                limit: 1000,
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

            /**
             * Subscriptions
             */

            /** Quotes */
            gql.subscription({
                quotesWma: [
                    {
                        where: {
                            currencyPairId: { _eq: symbol.id },
                        },
                        order_by: { timestamp: "desc" },
                        limit: 1,
                    },
                    {
                        currencyPairId: true,
                        price: true,
                        timestamp: true,
                    },
                ],
            }).subscribe({
                next: data => {
                    const quote = data.quotesWma[0]
                    marketStore.updateQuotes({
                        target: symbol.symbol,
                        quote,
                    })
                },
                error: console.error,
            })
        })
    }

    return { setupMarket, setupUser, symbols }
}
