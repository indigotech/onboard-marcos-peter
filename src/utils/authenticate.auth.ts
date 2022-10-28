import { User } from '../entity/User';
import { CustomError } from '../errors/error-formatter';
import { generateToken, PasswordEncripter } from '../utils';
import { LoginInput, LoginOutput } from '../models/user-models';

export async function authenticateUser(args: { login: LoginInput }): Promise<Partial<LoginOutput>> {
  const crypt = new PasswordEncripter();

  const user = await User.findOneBy({ email: args.login.email });

  if (!user) {
    throw new CustomError('User not found.', 404);
  }

  const passwordMatch = await crypt.isEqual(args.login.password, user.password);

  if (!passwordMatch) {
    throw new CustomError('Invalid credentials. Wrong email or password.', 401);
  }

  const token = generateToken(user.id, args.login.rememberMe);

  return { user, token };
}
