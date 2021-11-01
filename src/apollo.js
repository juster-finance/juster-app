import {
    ApolloClient,
    InMemoryCache,
    HttpLink,
    from,
} from "@apollo/client/core"

const link = from([
    new HttpLink({ uri: "https://juster-staging.dipdup.net/v1/graphql" }),
])

export const apollo = new ApolloClient({
    link,
    cache: new InMemoryCache(),
    connectToDevTools: true,
})
