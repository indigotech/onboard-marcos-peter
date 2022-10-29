import * as dotenv from 'dotenv';
import { Seed } from './seed';
import { setup } from '../src/setup';
import { User } from '../src/entity/User';

dotenv.config({ path: `${process.cwd()}/test.env` });

async function populateDatabase(generateUsersQtt: number) {
  await setup();
  for (let i = 0; i < generateUsersQtt; i++) {
    await User.save(await Seed.generateRandomUser());
  }
  process.exit();
}

populateDatabase(100);
