import 'mocha';
import { setup } from '../src/setup';
import * as dotenv from 'dotenv';

before('[SERVER] Starting server', async function () {
  dotenv.config({ path: `${process.cwd()}/test.env` });
  await setup();
});

require('./create-user.test');
require('./login.test');
require('./hello.test');
