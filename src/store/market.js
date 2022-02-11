import { defineStore } from "pinia"
import { cloneDeep } from "lodash"

export const useMarketStore = defineStore({
    id: "market",

    state() {
        return {
            isMarketsLoaded: false,

            events: [],

            markets: {
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
        setMarket({ target, symbol }) {
            this.markets[target] = { ...this.markets[target], ...symbol }
        },

        setQuotes({ target, quotes }) {
            this.markets[target].quotes = [...quotes]
        },
        clearQuotes() {
            Object.keys(this.markets).forEach(symbol => {
                this.markets[symbol].quotes = []
            })
        },

        setHistoryPrice({ target, price }) {
            this.markets[target].historyPrice = price
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
            if (quote.timestamp == this.markets[target].quotes[0].timestamp)
                return

            this.markets[target].quotes.unshift(quote)
        },
    },
})
