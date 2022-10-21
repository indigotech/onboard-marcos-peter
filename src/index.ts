import { ApolloServer } from 'apollo-server';
import { AppDataSource } from './data-source';
import 'reflect-metadata';
import { resolvers } from './resolvers/resolver';
import { typeDefs } from './type-defs/type-defs';

const port = 3333;

export async function runDatabase() {
  await AppDataSource.initialize().catch((error) => {
    console.info(`[DATABASE] - ${error}`);
    console.info('[DATABASE] - Shutting down server...');
    process.exit();
  });
}

export function runServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  runDatabase();

  server.listen({ port });
  console.info(`[SERVER] - Server running at http://localhost:${port}/graphql`);
}

runServer();
