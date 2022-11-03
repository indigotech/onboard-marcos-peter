import { user, users } from '../resolvers/queries/';
import { createUser, login } from './mutations';

export const resolvers = {
  Query: {
    user,
    users,
    hello: () => 'Hello, Taqtiler!',
  },
  Mutation: {
    createUser,
    login,
  },
};
