import { ApolloServer, gql } from 'apollo-server';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';

const typeDefs = gql `
  type Query {
    hello: String
  }
`;

const resolvers = {
  Query: {
    hello: () => 'This is a Hello World! from a GraphQL API configured with Apollo Server',
  }
};

const server = new ApolloServer ({
  typeDefs,
  resolvers,
  csrfPrevention: true,
  cache: 'bounded',
  plugins: [
    ApolloServerPluginLandingPageLocalDefault({ embed: true })
  ],
});

server.listen().then(
  ({ url }) => console.log(`[SERVER] - Server running at ${url}`)
);
