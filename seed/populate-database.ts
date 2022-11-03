import * as dotenv from 'dotenv';
import { setup } from '../src/setup';
import { populateDatabase } from './generate-random-user';

dotenv.config({ path: `${process.cwd()}/test.env` });

export async function seed() {
  await setup();
  await populateDatabase(2);
  process.exit();
}

seed();
