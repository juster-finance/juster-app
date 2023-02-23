export const formatQuote = (amount) => {
	return (amount / 1000000).toFixed(2)
}

export const numberWithSymbol = (target, symbol) => {
	if (!target) return 0

	let num = parseFloat(target)

	if (num % 1 === 0) {
		num = num.toFixed(0)
	} else {
		num = num.toFixed(2)
	}

	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, symbol)
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
		.find(function (item) {
			return num >= item.value
		})
	return item
		? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol
		: "0"
}

export const f = (num) => {
	if (num % 1 === 0) {
		return num.toFixed(0)
	} else {
		return num.toFixed(2)
	}
}

export const toFix = (num, fractionDigits = 2) => {
	const rgxp = new RegExp(`^-?\\d+(?:\\.\\d{0,${fractionDigits}})?`)
	return num.toString().match(rgxp)[0]
}

export const crop = (num, p = 6) => {
	if (isNaN(num)) return `0.0`

	let i = p
	const t = []

	const splittedNum = num.toString().split(".")

	if (splittedNum[1]) {
		splittedNum[1].split("").forEach((n) => {
			if (n == "0") {
				if (i == 0) return
				if (i !== 6) i -= 1
				t.push(n)
			} else {
				if (i == 0) return
				i -= 1
				t.push(n)
			}
		})

		return `${splittedNum[0]}.${t.join("")}`
	} else {
		return num
	}
}

export const truncate = (num) => {
	if (!num) return num

	/** todo: refactor */
	if (num.toString().includes("e")) return 0

	const [left, right] = num.toString().split(".")
	let result = ""
	const rightArr = right.split("")

	for (let i = 0; i < rightArr.length; i++) {
		const digit = rightArr[i]
		if (digit == "0" || digit == ".") {
			result += digit
		} else {
			result += digit
			break
		}
	}

	return `${left}.${result}`
}
