import { CreateUserInput, LoginInput, Pagination } from '../models/user-models';
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
    async users(_: unknown, args: { input: Pagination }, context) {
      getUserId(context.token);

      const skip = args.input?.skip ?? 0;
      const limit = args.input?.limit ?? 5;

      if (skip < 0) {
        throw new CustomError('Skip must be greater than 0', 400);
      }

      if (limit <= 0) {
        throw new CustomError('Limit must be a positive number', 400);
      }
      const [users, totalUsers] = await User.findAndCount({ skip, take: limit, order: { name: 'ASC' } });
      const after = totalUsers - skip - limit;

      if (totalUsers <= 0 || skip >= totalUsers) {
        return { users: [], totalUsers, before: totalUsers, after: 0 };
      }

      return {
        totalUsers: totalUsers,
        before,
        after: after < 0 ? 0 : after,
        users,
      };
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
