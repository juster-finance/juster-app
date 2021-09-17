export const prepareQuotesForD3 = ({ quotes }) => {
    return [...quotes].reverse().map(quote => {
        return { value: quote.price, date: new Date(quote.timestamp) }
    })
}
