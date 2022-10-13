import { ApolloServer } from 'apollo-server';
import { AppDataSource } from './data-source';
import 'reflect-metadata';
import { resolvers } from './resolvers/resolver';
import { typeDefs } from './type-defs/type-defs';

const port = 3333;

AppDataSource.initialize()
  .then(async () => console.log(`Connected to database.`))
  .catch((error) => console.log(error));

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen({ port }).then(({ url }) => {
  console.log(`[SERVER] - Server running at ${url}`);
});
