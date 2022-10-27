import { User } from '../entity/User';
import { CustomError } from '../errors/error-formatter';
import { PasswordEncripter } from '../utils/password-encripter';
import { sign } from 'jsonwebtoken';
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

  if (args.login.rememberMe) {
    const token = sign(
      { iss: 'onboard-marcos-peter-API', sub: { id: user.id, name: user.name, email: user.email } },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXTENDED_EXPIRATION,
      },
    );
    console.info(`[SERVER] - User logged in: ${user.name}`);

    return { user, token };
  }

  const token = sign(
    { iss: 'onboard-marcos-peter-API', sub: { id: user.id, name: user.name, email: user.email } },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
  );

  return { user, token };
}
