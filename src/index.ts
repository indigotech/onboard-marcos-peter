import { ApolloServer } from 'apollo-server';
import { AppDataSource } from './data-source';
import 'reflect-metadata';
import { resolvers } from './resolvers/resolver';
import { typeDefs } from './type-defs/type-defs';

const port = 3333;

export async function runServer(isMain = false) {
  await AppDataSource.initialize().catch((error) => console.log(error));

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  if (isMain) {
    server.listen({ port }).then(({ url }) => {
      console.log(`[SERVER] - Server running at ${url}`);
    });
  }
}

if (require.main === module) {
  const isMain = true;
  runServer(isMain);
}
