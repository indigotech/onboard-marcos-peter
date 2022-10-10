import { AppDataSource } from '../data-source';
import { User } from '../entity/User';

interface UserInput {
  name: string;
  email: string;
  password: string;
  birthdate: string;
}

export const resolvers = {
  Query: {
    users: () => AppDataSource.manager.getRepository('user').createQueryBuilder('user').getMany(),
  },
  Mutation: {
    createUser: async (parent: any, args: UserInput) => {
      const newUser = new User();
      newUser.name = args.name;
      newUser.email = args.email;
      newUser.password = args.password;
      newUser.birthdate = args.birthdate;

      await AppDataSource.manager.save(newUser);

      return newUser;
    },
  },
};
