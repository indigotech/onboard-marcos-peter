import { setup } from './setup';
import * as dotenv from 'dotenv';

dotenv.config({ path: `${process.cwd()}/.env` });

setup();
