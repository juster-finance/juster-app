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
