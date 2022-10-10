// import { ApolloServer, gql } from 'apollo-server';
// import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';

// const typeDefs = gql `
//   type Query {
//     hello: String
//   }
// `;

// const resolvers = {
//   Query: {
//     hello: () => 'This is a Hello World! from a GraphQL API configured with Apollo Server',
//   }
// };

// const server = new ApolloServer ({
//   typeDefs,
//   resolvers,
//   csrfPrevention: true,
//   cache: 'bounded',
//   plugins: [
//     ApolloServerPluginLandingPageLocalDefault({ embed: true })
//   ],
// });

// server.listen().then(
//   ({ url }) => console.log(`[SERVER] - Server running at ${url}`)
// );

import { AppDataSource } from './data-source';
import { User } from './entity/User';
import { apolloServerRun } from './apolloServer';

AppDataSource.initialize()
  .then(async () => {
    console.log('[SERVER] - Database connected');
    const user = new User();
    user.name = 'Marcos Peter';
    user.email = 'mpeterlobato@gmail.com';
    user.password = 'A@123456';
    user.birthdate = '1994-09-27';
    await AppDataSource.manager.save(user);
    console.log(`[SERVER] - User saved with id: ${user.id}`);

    console.log('[SERVER] - Loading users from database');
    const users = await AppDataSource.manager.find(User);
    console.log(`[SERVER] - Users loaded:  ${users}`);
  })
  .then(apolloServerRun)
  .catch((error) => console.log(error));
