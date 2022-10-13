import { CreateUserInput, UserInput, UserOutput } from '../models/user-models';
import { User } from '../entity/User';
import { AppDataSource } from '../data-source';
import { EncryptPassword } from '../utils/encrypt-password';

const userRepo = AppDataSource.getRepository(User);
const crypt = new EncryptPassword();

async function validateInput(userData: UserInput) {
  const passwordRegex = new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,16}$/);
  if (passwordRegex.test(userData.password) == false) {
    throw new Error(
      'Password must have between 8 and 16 characters long and must have at least one uppercase, one lowercase letter and one digit.',
    );
  }

  const emailCount = await userRepo.findAndCountBy({ email: userData.email });
  if (emailCount[1] >= 1) {
    throw new Error('Email address already in use.');
  }

  if (!userData.name) {
    throw new Error('Name is required.');
  } else if (userData.name.length < 3) {
    throw new Error('Name must have at least 3 characters.');
  } else if (!userData.name.trim()) {
    throw new Error('Name cannot be empty.');
  }

  if (!userData.birthdate) {
    throw new Error('Birthdate is required.');
  }
  if (!new Date(userData.birthdate).getTime()) {
    throw new Error('Birthdate must be a valid date.');
  }
}

export const resolvers = {
  Query: {
    users: () => userRepo.find(),
  },
  Mutation: {
    async createUser(_: unknown, args: CreateUserInput): Promise<UserOutput> {
      const newUser = new User();
      newUser.name = args.userData.name;
      newUser.email = args.userData.email;
      newUser.password = await crypt.encryptPassword(args.userData.password);
      newUser.birthdate = args.userData.birthdate;

      await validateInput(args.userData);
      await userRepo.save(newUser);
      return newUser;
    },
  },
};
