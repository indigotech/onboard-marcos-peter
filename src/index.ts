import { ApolloServer } from 'apollo-server';
import { AppDataSource } from './data-source';
import 'reflect-metadata';
import { resolvers } from './resolvers/resolver';
import { typeDefs } from './type-defs/type-defs';

const port = 3333;

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const startServer = server.listen({ port }).then(({ url }) => {
  console.log(`[SERVER] - Server running at ${url}`);
});

export async function runServer(isMain = false) {
  await AppDataSource.initialize()
    .then(() => {
      console.log(`[SERVER] - Connected to database.`);
      startServer;
    })
    .catch((error) => {
      console.log(`[SERVER: ERROR] - ${error}`);
      server.stop();
    });

  if (isMain) {
    startServer;
  }
}

if (require.main === module) {
  const isMain = true;
  runServer(isMain);
}
