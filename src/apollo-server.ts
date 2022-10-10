import * as fs from 'fs';
import * as path from 'path';
import { ApolloServer } from 'apollo-server';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import { resolvers } from './resolvers/resolver';

interface UserInput {
  name: string;
  email: string;
  password: string;
  birthdate: string;
}

export async function apolloServerRun() {
  const server = new ApolloServer({
    typeDefs: fs.readFileSync(path.join(__dirname, 'schema.graphql'), 'utf8'),
    resolvers,
    csrfPrevention: true,
    cache: 'bounded',
    plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
  });

  const serverInfo = await server.listen();
  console.log(`[SERVER] - Server running at ${ serverInfo.url }`);
}
