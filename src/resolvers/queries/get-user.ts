import { UserOutput } from './../../models/user-models';
import { User } from '../../entity/User';
import { CustomError } from '../../errors/error-formatter';
import { getUserId } from '../../utils';

export async function user(_: unknown, args: { id: number }, context): Promise<UserOutput> {
  getUserId(context.token);
  const user = await User.findOne({
    where: { id: args.id },
    relations: { addresses: true },
  });
  if (!user) {
    throw new CustomError('User not found', 404);
  }
  return user;
}
