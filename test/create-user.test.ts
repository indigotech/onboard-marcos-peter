import 'mocha';
import axios from 'axios';
import { expect } from 'chai';
import { User } from '../src/entity/User';
import { PasswordEncripter } from '../src/utils/password-encripter';

const connection = axios.create({ baseURL: 'http://localhost:3333/' });
const crypt = new PasswordEncripter();

describe('Test createUser', () => {
  it('should insert a user into the database', async () => {
    const query = `mutation CreateUser($input: UserInput!) {
      createUser(userData: $input){
        id
        name
        email
        birthdate
      }
    }`;

    const input = {
      name: 'Marcos Peter Souza Lobato Junior',
      email: 'marcos.peter@taqtile.com.br',
      password: 'BoaSenha123',
      birthdate: '1994-09-27',
    };

    const result = await connection.post('/graphql', { query: query, variables: { input } });
    const user = await User.findOneBy({ email: input.email });

    const passwordsMatch = await crypt.isEqual(input.password, user.password);

    expect(user.id).to.be.gt(0);
    expect(user.name).to.be.eq(input.name);
    expect(user.email).to.be.eq(input.email);
    expect(passwordsMatch).to.be.true;
    expect(user.birthdate).to.be.eq(input.birthdate);

    expect(result.data.data.createUser).to.be.deep.eq({
      id: user.id,
      name: input.name,
      email: input.email,
      birthdate: input.birthdate,
    });

    await User.delete({ email: input.email });
  });
});
