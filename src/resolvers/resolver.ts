import { CreateUserInput, LoginInput } from '../models/user-models';
import { User } from '../entity/User';
import { authenticateUser, getUserId, PasswordEncripter, validateInput } from '../utils';

const crypt = new PasswordEncripter();

export const resolvers = {
  Query: {
    users: async () => await User.find(),
    hello: () => 'Hello, Taqtiler!',
  },
  Mutation: {
    async createUser(_: unknown, args: CreateUserInput, context) {
      getUserId(context.token);

      const newUser = Object.assign(new User(), {
        ...args.userData,
        password: await crypt.encrypt(args.userData.password),
      });

      await validateInput(args.userData);
      await User.save(newUser);
      return newUser;
    },
    login(_: unknown, args: { login: LoginInput }) {
      return authenticateUser(args);
    },
  },
};
