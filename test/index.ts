import { setup } from '../src/setup';
import * as dotenv from 'dotenv';

before('[SERVER] Starting server', async function () {
  dotenv.config({ path: `${process.cwd()}/test.env` });
  await setup();
});

// require('./login.test');
// require('./create-user.test');
// require('./hello.test');
// require('./user.test');
require('./users.test');
