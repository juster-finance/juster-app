export const formatQuote = amount => {
    return (amount / 1000000).toFixed(2)
}

export const numberWithSymbol = (target, symbol) => {
    if (!target) return
    return target.toString().replace(/\B(?=(\d{3})+(?!\d))/g, symbol)
}

export const calcChange = (a, b) => {
    const diff = a - b
    const percent = (100 * Math.abs(a - b)) / ((a + b) / 2)
    const isIncreased = Math.sign(diff) > 0

    return { diff: Math.abs(diff), percent, isIncreased }
}

/** Abbreviate */
export const abbreviateNumber = (num, digits = 1) => {
    const lookup = [
        { value: 1, symbol: "" },
        { value: 1e3, symbol: "k" },
        { value: 1e6, symbol: "M" },
        { value: 1e9, symbol: "G" },
        { value: 1e12, symbol: "T" },
        { value: 1e15, symbol: "P" },
        { value: 1e18, symbol: "E" },
    ]
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/
    var item = lookup
        .slice()
        .reverse()
        .find(function(item) {
            return num >= item.value
        })
    return item
        ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol
        : "0"
}
