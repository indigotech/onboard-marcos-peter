import 'mocha';
import axios from 'axios';
import { expect } from 'chai';
import { User } from '../src/entity/User';
import { generateToken } from '../src/utils';
import { UserInput } from '../src/models/user-models';
import { PasswordEncripter } from '../src/utils';

describe('Test user query', () => {
  const connection = axios.create({ baseURL: 'http://localhost:3333/' });
  const crypt = new PasswordEncripter();
  const query = `query User($userId: Int!){
    user(id: $userId) {
      id
      name
      email
      birthdate
    }
  }`;

  let user: User;
  let token: string;
  let userId: number;
  const input: UserInput = {
    name: 'User Test One',
    email: 'usertestone@taqtile.com.br',
    password: 'GoodPassword123',
    birthdate: '2000-01-01',
  };

  before(async () => {
    token = generateToken(1, false);

    const newUser = Object.assign(new User(), { ...input, password: await crypt.encrypt(input.password) });

    user = await User.save(newUser);

    userId = user.id;
  });

  after(async () => {
    await User.delete(user.id);
  });

  it('Should return a existent user from database', async () => {
    const result = await connection.post(
      '/graphql',
      { query: query, variables: { userId } },
      { headers: { Authorization: token } },
    );

    const passwordsMatch = await crypt.isEqual(input.password, user.password);

    expect(userId).to.be.gt(0);
    expect(user.name).to.be.deep.eq(input.name);
    expect(user.email).to.be.deep.eq(input.email);
    expect(passwordsMatch).to.be.true;
    expect(user.birthdate).to.be.deep.eq(input.birthdate);
    expect(result.data.data.user).to.be.deep.eq({
      id: user.id,
      name: input.name,
      email: input.email,
      birthdate: input.birthdate,
    });
  });

  it('Should return an error for trying to find an user with an inexistent id', async () => {
    userId = 0;

    const result = await connection.post(
      'graphql',
      { query: query, variables: { userId } },
      { headers: { Authorization: token } },
    );

    expect(result.data.errors).to.be.deep.eq([
      {
        message: 'User not found',
        code: 404,
      },
    ]);
  });

  it('Should return an error for trying to execute the query without passing a token', async () => {
    const result = await connection.post('graphql', { query: query, variables: { userId } });

    expect(result.data.errors).to.be.deep.eq([
      {
        message: 'No token found',
        code: 401,
      },
    ]);
  });

  it('Should return an error for trying to execute the query with a random token', async () => {
    token = 'invalid token';

    const result = await connection.post(
      'graphql',
      { query: query, variables: { userId } },
      { headers: { Authorization: token } },
    );

    expect(result.data.errors).to.be.deep.eq([
      {
        message: 'Internal Server Error',
        code: 500,
        additionalInfo: 'jwt malformed',
      },
    ]);
  });

  it('Should return an error for trying to execute the query with an invalid token', async () => {
    token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVqCJ9.eyJpc3MiOiJvbmJvYXJkLW1hcmNvcy1wZXRlci1BUEkiLCJzdWIiOnsiaWQiOjI4LCJuYW1lIjoiTWFyY29zIFBldGVyIiwiZW1haWwiOiJtYXJjb3MucGV0ZXJAdGFxdGlsZS5jb20uYnIifSwiaWF0IjoxNjY2ODI3NDIxLCJleHAiOjE2NjY5MTM4MjF9.WBaxagf6qcgiTGrLKBHmkxQXxffWF0UnNh_oJidUf7ws';

    const result = await connection.post(
      'graphql',
      { query: query, variables: { userId } },
      { headers: { Authorization: token } },
    );

    expect(result.data.errors).to.be.deep.eq([
      {
        message: 'Internal Server Error',
        code: 500,
        additionalInfo: 'invalid token',
      },
    ]);
  });
});
