import { User } from '../entity/User';
import { CustomError } from '../errors/error-formatter';
import { UserInput } from '../models/user-models';

const passwordRegex = new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,16}$/);

export async function validateInput(userData: UserInput) {
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
