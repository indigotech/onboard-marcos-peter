import * as dotenv from 'dotenv';
import { generateRandomUser } from './generate-random-user';
import { setup } from '../src/setup';
import { User } from '../src/entity/User';

dotenv.config({ path: `${process.cwd()}/test.env` });

async function populateDatabase(usersQuantity: number) {
  await setup();
  for (let i = 0; i < usersQuantity; i++) {
    await User.save(await generateRandomUser());
  }
  process.exit();
}

populateDatabase(100);
