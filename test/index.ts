import 'mocha';
import axios from 'axios';
import { runServer } from '../src';

describe('Users query', function () {
  before('[SERVER] Starting server', function (done) {
    runServer().then(done);
  });
  it('Returning the users:', async function () {
    const endpoint = 'http://localhost:3333/';
    const query = `query User{
      users{id, name}
    }`;

    const connection = axios.create({ baseURL: endpoint });
    const result = await connection.post('/graphql', { query });
    console.table(JSON.stringify(result.data));
  });
});
