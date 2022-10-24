import { CreateUserInput, UserInput, LoginInput } from '../models/user-models';
import { User } from '../entity/User';
import { PasswordEncripter } from '../utils/password-encripter';
import { CustomError } from '../errors/error-formatter';

const crypt = new PasswordEncripter();
const passwordRegex = new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,16}$/);

async function validateInput(userData: UserInput) {
  if (!passwordRegex.test(userData.password)) {
    throw new CustomError(
      'Password must have between 8 and 16 characters long and must have at least one uppercase, one lowercase letter and one digit.',
      401,
    );
  }

  const emailAlreadyExists = await User.findOneBy({ email: userData.email });

  if (emailAlreadyExists) {
    throw new CustomError('Email already registered.', 409);
  }

  if (userData.name.length < 3) {
    throw new CustomError('Name must have at least 3 characters.', 401);
  }
  if (!userData.name.trim()) {
    throw new CustomError('Name cannot be empty.', 401);
  }

  if (!new Date(userData.birthdate).getTime()) {
    throw new CustomError('Birthdate must be a valid date.', 401);
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
    async login(_: unknown, args: { login: LoginInput }) {
      const user = await User.findOneBy({ email: args.login.email });

      if (!user) {
        throw new CustomError('User not found', 404);
      }

      const passwordMatch = await crypt.isEqual(args.login.password, user.password);

      if (!passwordMatch) {
        throw new CustomError('Invalid credentials. Wrong password.', 401);
      }

      return { user, token: 'the_token' };
    },
  },
};
