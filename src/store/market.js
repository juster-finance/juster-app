import { defineStore } from "pinia"

export const useMarketStore = defineStore({
    id: "market",

    state() {
        return {
            isSymbolsLoaded: false,
            symbols: {
                "BTC-USD": {
                    events: [],
                    quotes: [],
                    historyPrice: 0,
                },
                "ETH-USD": {
                    events: [],
                    quotes: [],
                    historyPrice: 0,
                },
                "XTZ-USD": {
                    events: [],
                    quotes: [],
                    historyPrice: 0,
                },
            },
        }
    },
    actions: {
        setSymbol({ target, symbol }) {
            this.symbols[target] = { ...this.symbols[target], ...symbol }
        },

        setQuotes({ target, quotes }) {
            this.symbols[target].quotes = [...quotes]
        },
        clearQuotes() {
            Object.keys(this.symbols).forEach(symbol => {
                this.symbols[symbol].quotes = []
            })
        },

        setHistoryPrice({ target, price }) {
            this.symbols[target].historyPrice = price
        },

        updateEvent({ target, newEvent }) {
            if (!target || !this.symbols[target].events.length) return

            let event = this.symbols[target].events.find(
                event => event.id == newEvent.id,
            )
            const indexOfEvent = this.symbols[target].events.indexOf(event)

            /** todo: store mixed events regardless of the currency pair */
            if (!event) return

            if (event.status !== newEvent.status) {
                this.symbols[target].events.splice(indexOfEvent, 1)
            } else {
                this.symbols[target].events[indexOfEvent] = {
                    ...event,
                    winnerBets: newEvent.winnerBets,
                    startRate: newEvent.startRate,
                    closedRate: newEvent.closedRate,
                    poolBelow: newEvent.poolBelow,
                    poolAboveEq: newEvent.poolAboveEq,
                    totalLiquidityProvided: newEvent.totalLiquidityProvided,
                    totalLiquidityShares: newEvent.totalLiquidityShares,
                    totalValueLocked: newEvent.totalValueLocked,
                }
            }
        },
        updateQuotes({ target, quote }) {
            if (quote.timestamp == this.symbols[target].quotes[0].timestamp)
                return

            this.symbols[target].quotes.unshift(quote)
        },
    },
})
