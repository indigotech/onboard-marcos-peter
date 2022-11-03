import { CreateUserInput, LoginInput } from '../models/user-models';
import { User } from '../entity/User';
import { authenticateUser, getUserId, PasswordEncripter, validateInput } from '../utils';
import { CustomError } from '../errors/error-formatter';

const crypt = new PasswordEncripter();

export const resolvers = {
  Query: {
    async user(_: unknown, args: { id: number }, context) {
      getUserId(context.token);
      const user = await User.findOneBy({ id: args.id });
      if (!user) {
        throw new CustomError('User not found', 404);
      }
      return user;
    },
    async users(_: unknown, args: { limit: number }, context) {
      getUserId(context.token);

      return User.find({ take: args.limit, order: { name: 'ASC' } });
    },
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
