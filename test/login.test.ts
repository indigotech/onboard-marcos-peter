import 'mocha';
import axios from 'axios';
import { expect } from 'chai';
import { User } from '../src/entity/User';
import { PasswordEncripter } from '../src/utils/password-encripter';

const connection = axios.create({ baseURL: 'http://localhost:3333/' });
const crypt = new PasswordEncripter();

describe('Test User Login', () => {
  it('should authenticate a user ', async () => {
    const input = {
      name: 'User Test One',
      email: 'usertestone@taqtile.com.br',
      password: 'GoodPassword123',
      birthdate: '2000-01-01',
    };

    const newUser = new User();
    newUser.name = input.name;
    newUser.email = input.email;
    newUser.password = await crypt.encrypt(input.password);
    newUser.birthdate = input.birthdate;

    await User.save(newUser);

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

  it('Should return an error for trying to authenticate an user with unregistered email', async () => {
    const input = {
      name: 'User Test One',
      email: 'usertestone@taqtile.com.br',
      password: 'GoodPassword123',
      birthdate: '2000-01-01',
    };

    const newUser = new User();
    newUser.name = input.name;
    newUser.email = input.email;
    newUser.password = await crypt.encrypt(input.password);
    newUser.birthdate = input.birthdate;

    await User.save(newUser);

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

    await User.delete({ email: login.email });
  });

  it('Should return an error for trying to authenticate an user with an wrong password', async () => {
    const input = {
      name: 'User Test One',
      email: 'usertestone@taqtile.com.br',
      password: 'GoodPassword123',
      birthdate: '2000-01-01',
    };

    const newUser = new User();
    newUser.name = input.name;
    newUser.email = input.email;
    newUser.password = await crypt.encrypt(input.password);
    newUser.birthdate = input.birthdate;

    await User.save(newUser);

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
      password: 'WrongPassword123',
    };

    const result = await connection.post('/graphql', { query: query, variables: { login } });

    expect(result.data.errors).to.be.deep.eq([
      {
        message: 'Invalid credentials. Wrong password.',
        code: 401,
      },
    ]);

    await User.delete({ email: login.email });
  });
});
