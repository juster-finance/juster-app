export const toClipboard = (value) => {
	navigator.clipboard.writeText(value)
}

export const getCurrencyIcon = (name) => {
	switch (name) {
		case "XTZ":
			return new URL(`../../assets/symbols/tz.png`, import.meta.url).href
		case "ETH":
			return new URL(`../../assets/symbols/eth.png`, import.meta.url).href
		case "BTC":
			return new URL(`../../assets/symbols/btc.png`, import.meta.url).href
		case "USD":
			return new URL(`../../assets/symbols/usd.png`, import.meta.url).href
	}
}

export const capitalizeFirstLetter = (str) => {
	return str.charAt(0).toUpperCase() + str.slice(1)
}

export const pluralize = (val, word, plural = word + "s") => {
	const _pluralize = (num, word, plural = word + "s") =>
		[1, -1].includes(Number(num)) ? word : plural
	if (typeof val === "object")
		return (num, word) => _pluralize(num, word, val[word])
	return _pluralize(val, word, plural)
}

export const shorten = (str, left = 6, right = 4) => {
	return `${str.slice(0, left)}...${str.slice(
		str.length - right,
		str.length,
	)}`
}

export const sanitizeInput = (e) => {
	if (["-", "e", "E"].includes(e.key)) e.preventDefault()
}
