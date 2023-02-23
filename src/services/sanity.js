const getSanityImageUrl = (image) => {
	const idx = image.asset._ref.lastIndexOf("-")
	const format = image.asset._ref.slice(idx + 1)

	return `https://cdn.sanity.io/images/2tokh3zd/production/${image.asset._ref.slice(
		6,
		idx,
	)}.${format}`
}

export { getSanityImageUrl }
