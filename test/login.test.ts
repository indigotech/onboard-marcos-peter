import { UserInput } from './../src/models/user-models';
import axios from 'axios';
import { expect } from 'chai';
import { User } from '../src/entity/User';
import { PasswordEncripter } from '../src/utils';

const connection = axios.create({ baseURL: 'http://localhost:3333/' });
const crypt = new PasswordEncripter();

describe('Test User Login Mutation', () => {
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

  let createdUser: User;

  before(async () => {
    const userTestInput: UserInput = {
      name: 'User Test One',
      email: 'usertestone@taqtile.com.br',
      password: 'GoodPassword123',
      birthdate: '2000-01-01',
    };

    const passwordHashed = await crypt.encrypt(userTestInput.password);

    const newUser = Object.assign(new User(), { ...userTestInput, password: passwordHashed });

    createdUser = await User.save(newUser);
  });

  after(async () => {
    await User.delete(createdUser.id);
  });

  it('Should authenticate a user ', async () => {
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

    expect(result.data.data.login.token.length).to.be.gt(0);
  });

  it('Should return an error for trying to authenticate an user with unregistered email', async () => {
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
    const login = {
      email: 'usertestone@taqtile.com.br',
      password: 'WrongPassword123',
    };

    const result = await connection.post('/graphql', { query: query, variables: { login } });

    expect(result.data.errors).to.be.deep.eq([
      {
        message: 'Invalid credentials. Wrong email or password.',
        code: 401,
      },
    ]);
  });
});
