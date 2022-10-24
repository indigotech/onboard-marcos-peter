import { ApolloServer } from 'apollo-server';
import { AppDataSource, dataSourceSetup } from './data-source';
import { formatError } from './errors/error-formatter';
import { resolvers } from './resolvers/resolver';
import { typeDefs } from './type-defs/type-defs';

async function runDatabase() {
  console.info(`[DATABASE] - Starting database: '${process.env.POSTGRES_DATABASE}'...`);
  dataSourceSetup();
  await AppDataSource.initialize().catch((error) => {
    console.info(`[DATABASE] - ${error}`);
    console.info('[DATABASE] - Shutting down server...');
    process.exit();
  });
  console.info('[DATABASE] - Database running...');
}

async function runServer() {
  console.info('[SERVER] - Starting server...');
  const port = process.env.PORT || 3333;
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError,
  });

  await server.listen({ port });
  console.info(`[SERVER] - Server running at http://localhost:${port}/graphql`);
}

export async function setup() {
  await runDatabase();
  await runServer();
}
