import { LoginInput } from '../../models/user-models';
import { authenticateUser } from '../../utils';

export async function login(_: unknown, args: { login: LoginInput }) {
  return authenticateUser(args);
}
