import 'mocha';
import axios from 'axios';
import { expect } from 'chai';
import { User } from '../src/entity/User';
import { PasswordEncripter } from '../src/utils/password-encripter';

const connection = axios.create({ baseURL: 'http://localhost:3333/' });
const crypt = new PasswordEncripter();

describe('Test User Login', () => {
  it('should insert an user into the database', async () => {
    const query = `mutation CreateUser($input: UserInput!) {
      createUser(userData: $input){
        id
        name
        email
        birthdate
      }
    }`;

    const input = {
      name: 'User Test One',
      email: 'usertestone@taqtile.com.br',
      password: 'GoodPassword123',
      birthdate: '2000-01-01',
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
  });

  it('should authenticate the previous created user ', async () => {
    const query = `mutation Login($login: LoginInput) {
      login(login: $login) {
        user {
          id
          name
          email
          birthdate
        }
        token
      }
    }`;

    const login = {
      email: 'usertestone@taqtile.com.br',
      password: 'GoodPassword123',
    };

    const result = await connection.post('/graphql', { query: query, variables: { login } });
    const user = await User.findOneBy({ email: login.email });

    expect(user.id).to.be.gt(0);
    expect(user.email).to.be.eq(login.email);

    expect(result.data.data.login.user).to.be.deep.eq({
      id: user.id,
      name: user.name,
      email: user.email,
      birthdate: user.birthdate,
    });

    expect(result.data.data.login.token).to.be.deep.eq('the_token');

    await User.delete(user.id);
  });
});
