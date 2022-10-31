import axios from 'axios';
import { expect } from 'chai';

describe('Hello query', function () {
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
