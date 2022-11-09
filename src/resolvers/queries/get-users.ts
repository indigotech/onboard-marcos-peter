import { User } from '../../entity/User';
import { CustomError } from '../../errors/error-formatter';
import { Pagination } from '../../models/user-models';
import { getUserId } from '../../utils';

export async function users(_: unknown, args: { input: Pagination }, context) {
  getUserId(context.token);

  let before: number;

  const skip = args.input.skip ?? 0;
  const limit = args.input.limit ?? 5;
  const [users, totalUsers] = await User.findAndCount({
    skip,
    take: limit,
    order: { name: 'ASC' },
    relations: { addresses: true },
  });
  const after: number = totalUsers - (before = skip) - limit;

  if (totalUsers <= 0 || skip >= totalUsers) {
    throw new CustomError('No users found', 404);
  }

  return {
    totalUsers: totalUsers,
    before,
    after: after < 0 ? 0 : after,
    users,
  };
}
