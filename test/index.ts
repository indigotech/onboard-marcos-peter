import 'mocha';
import axios from 'axios';
import { expect } from 'chai';
import { setup } from '../src/setup';
import * as dotenv from 'dotenv';

describe('Users query', function () {
  before('[SERVER] Starting server', async function () {
    dotenv.config({ path: `${process.cwd()}/test.env` });
    await setup();
  });
  it('Hello query:', async function () {
    const endpoint = 'http://localhost:3333/';
    const query = `query Hello{
      hello
    }`;

    const connection = axios.create({ baseURL: endpoint });
    const result = await connection.post('/graphql', { query });

    expect(result.data.data.hello).to.be.eq('Hello, Taqtiler!');
  });
});
