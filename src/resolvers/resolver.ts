import { CreateUserInput, UserInput } from '../models/user-models';
import { User } from '../entity/User';
import { PasswordEncripter } from '../utils/password-encripter';

const crypt = new PasswordEncripter();
const passwordRegex = new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,16}$/);

async function validateInput(userData: UserInput) {
  if (!passwordRegex.test(userData.password)) {
    throw new Error(
      'Password must have between 8 and 16 characters long and must have at least one uppercase, one lowercase letter and one digit.',
    );
  }

  const emailAlreadyExists = await User.findOneBy({ email: userData.email });

  if (emailAlreadyExists) {
    throw new Error('Email already registered.');
  }

  if (userData.name.length < 3) {
    throw new Error('Name must have at least 3 characters.');
  }
  if (!userData.name.trim()) {
    throw new Error('Name cannot be empty.');
  }

  if (!new Date(userData.birthdate).getTime()) {
    throw new Error('Birthdate must be a valid date.');
  }
}

export const resolvers = {
  Query: {
    users: async () => await User.find(),
    hello: () => 'Hello, Taqtiler!',
  },
  Mutation: {
    async createUser(_: unknown, args: CreateUserInput) {
      const newUser = new User();
      newUser.name = args.userData.name;
      newUser.email = args.userData.email;
      newUser.password = await crypt.encrypt(args.userData.password);
      newUser.birthdate = args.userData.birthdate;

      await validateInput(args.userData);
      await User.save(newUser);
      return newUser;
    },
  },
};
