import { defineStore } from "pinia"

export const useMarketStore = defineStore({
    id: "market",

    state() {
        return {
            isSymbolsLoaded: false,

            events: [],

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

        updEvent(newEvent) {
            let event = this.events.find(event => event.id == newEvent.id)
            const indexOfEvent = this.events.indexOf(event)

            if (event.status !== newEvent.status) {
                this.events.splice(indexOfEvent, 1)
            } else {
                this.events[indexOfEvent] = { ...event, ...newEvent }
            }
        },

        updateQuotes({ target, quote }) {
            if (quote.timestamp == this.symbols[target].quotes[0].timestamp)
                return

            this.symbols[target].quotes.unshift(quote)
        },
    },
})
