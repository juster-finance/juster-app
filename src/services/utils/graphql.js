export const toGqlParams = (obj) => {
	if (typeof obj !== "object")
    	return JSON.stringify(obj)

    if (Array.isArray(obj))
        return `[${obj.map(toGqlParams).join(",")}]`

    let props = Object
    	.keys(obj)
        .map(key => obj[key] !== undefined ? `${key}:${toGqlParams(obj[key])}`: undefined)
        .filter(v => v)
        .join(",")

    return `{${props}}`
}

export const getMinMaxGql = (min, max) => (
    min === undefined && max === undefined 
        ? undefined
        : min === undefined 
            ? { _lte: max } 
            : max === undefined 
                ? { _gte: min } 
                : { _gte: min, _lte: max }
)
