export const toClipboard = value => {
    const el = document.createElement("textarea")
    el.value = value
    el.setAttribute("readonly", "")
    el.style.position = "absolute"
    el.style.left = "-9999px"
    document.body.appendChild(el)
    el.select()
    document.execCommand("copy")
    document.body.removeChild(el)
}

export const getCurrencyIcon = name => {
    switch (name) {
        case "XTZ":
            return require(`@/assets/symbols/tz.png`)
        case "ETH":
            return require(`@/assets/symbols/eth.png`)
        case "BTC":
            return require(`@/assets/symbols/btc.png`)
        case "USD":
            return require(`@/assets/symbols/usd.png`)
    }
}

export const capitalizeFirstLetter = str => {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export const pluralize = (val, word, plural = word + "s") => {
    const _pluralize = (num, word, plural = word + "s") =>
        [1, -1].includes(Number(num)) ? word : plural
    if (typeof val === "object")
        return (num, word) => _pluralize(num, word, val[word])
    return _pluralize(val, word, plural)
}
