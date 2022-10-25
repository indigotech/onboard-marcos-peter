import 'mocha';
import axios from 'axios';
import { expect } from 'chai';
import { User } from '../src/entity/User';
import { PasswordEncripter } from '../src/utils/password-encripter';

const connection = axios.create({ baseURL: 'http://localhost:3333/' });
const crypt = new PasswordEncripter();

describe('Test createUser errors', () => {
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
      name: 'User Test Login',
      email: 'usertestlogin@taqtile.com.br',
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

  it('Should return an error for trying to authenticate an user with unregistered email', async () => {
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
      email: 'wrongusertestlogin@taqtile.com.br',
      password: 'GoodPassword123',
    };

    const result = await connection.post('/graphql', { query: query, variables: { login } });

    expect(result.data.errors).to.be.deep.eq([
      {
        message: 'User not found.',
        code: 404,
      },
    ]);
  });

  it('Should return an error for trying to authenticate an user with an wrong password', async () => {
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
      email: 'usertestlogin@taqtile.com.br',
      password: 'WrongPassword123',
    };

    const result = await connection.post('/graphql', { query: query, variables: { login } });

    expect(result.data.errors).to.be.deep.eq([
      {
        message: 'Invalid credentials. Wrong email or password.',
        code: 401,
      },
    ]);

    await User.delete({ email: login.email });
  });
});
