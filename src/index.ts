import { ApolloServer } from "apollo-server";

import { schema } from "./schema";

export const server = new ApolloServer({
    schema,
});

const port = 333;

server.listen({port}).then(({url}) => {
    console.log(`🐝 Server ready at ${url}`);
})