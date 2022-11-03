import { generateRandomAddress } from '../../../seed/generate-random-address';
import { User } from '../../entity/User';
import { CreateUserInput } from '../../models/user-models';
import { getUserId, validateInput } from '../../utils';
import { PasswordEncripter } from '../../utils';

const crypt = new PasswordEncripter();

export async function createUser(_: unknown, args: CreateUserInput, context) {
  getUserId(context.token);

  const newUser = Object.assign(new User(), {
    ...args.userData,
    password: await crypt.encrypt(args.userData.password),
  });
  newUser.addresses = [generateRandomAddress(newUser), generateRandomAddress(newUser)];

  await validateInput(args.userData);
  await User.save(newUser);
  return newUser;
}
