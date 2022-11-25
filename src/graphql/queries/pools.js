import gql from "graphql-tag"

export const getAllPools = gql`
	query getAllPools {
		pool {
			name
			version
			address
		}
	}
`
