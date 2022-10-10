import { AppDataSource } from './data-source';
import { User } from './entity/User';
import { apolloServerRun } from './apollo-server';

AppDataSource.initialize()
  .then(async () => {
    console.log('[SERVER] - Database connected');
    const user = new User();
    user.name = 'Marcos Peter';
    user.email = 'mpeterlobato@gmail.com';
    user.password = 'A@123456';
    user.birthdate = '1994-09-27';
    await AppDataSource.manager.save(user);
    console.log(`[SERVER] - User saved with id: ${user.id}`);

    console.log('[SERVER] - Loading users from database');
    const users = await AppDataSource.manager.find(User);
    console.log(`[SERVER] - Users loaded:  ${users}`);
  })
  .then(apolloServerRun)
  .catch((error) => console.log(error));
