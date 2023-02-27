import axios from "axios"

/**
 * Config
 */
import { sanity } from "@config"

export const fetchPosts = async () => {
	try {
		const {
			data: { result: posts },
		} = await axios.get(
			`https://${sanity.id}.apicdn.sanity.io/v1/data/query/production?query=*[_type == 'post'] { ..., section->, content[] { ..., asset-> } }`,
		)

		return posts
	} catch (error) {
		console.error(error)
		return {}
	}
}

export const fetchPostById = async (id) => {
	try {
		const {
			data: { result: post },
		} = await axios.get(
			`https://${sanity.id}.apicdn.sanity.io/v1/data/query/production?query=${encodeURIComponent(
				`*[_type == 'post' && _id == '${id}']`,
			)} { ..., section-> }`,
		)

		return post[0]
	} catch (error) {
		console.error(error)
		return {}
	}
}

export const fetchArticles = async () => {
	try {
		const {
			data: { result: articles },
		} = await axios.get(
			`https://${sanity.id}.apicdn.sanity.io/v1/data/query/production?query=*[_type == 'article'] {..., content[] { ..., asset-> } }`,
		)

		return articles
	} catch (error) {
		console.error(error)
		return {}
	}
}

export const fetchArticleBySlug = async (slug) => {
	try {
		const {
			data: { result: article },
		} = await axios.get(
			`https://${sanity.id}.apicdn.sanity.io/v1/data/query/production?query=${encodeURIComponent(
				`*[_type == 'article' && slug.current == "${slug}"] {..., content[] { ..., asset-> } }`,
			)}`,
		)

		return article[0]
	} catch (error) {
		console.error(error)
		return {}
	}
}

export const fetchSections = async () => {
	try {
		const {
			data: { result: sections },
		} = await axios.get(`https://${sanity.id}.apicdn.sanity.io/v1/data/query/production?query=*[_type == 'section']`)

		return sections
	} catch (error) {
		console.error(error)
		return {}
	}
}

export const fetchReleases = async () => {
	try {
		const {
			data: { result: releases },
		} = await axios.get(`https://${sanity.id}.apicdn.sanity.io/v1/data/query/production?query=*[_type == 'release']`)

		return releases
	} catch (error) {
		console.error(error)
		return {}
	}
}
