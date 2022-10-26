import 'mocha';
import axios from 'axios';
import { expect } from 'chai';
import { User } from '../src/entity/User';
import { PasswordEncripter } from '../src/utils/password-encripter';
import { generateToken } from '../src/utils/jwt-utils';
import { UserInput } from '../src/models/user-models';

describe('Test createUser Mutation', () => {
  const connection = axios.create({ baseURL: 'http://localhost:3333/' });
  const crypt = new PasswordEncripter();
  const query = `mutation CreateUser($input: UserInput!) {
    createUser(userData: $input){
      id
      name
      email
      birthdate
    }
  }`;

  let token: string;
  let input: UserInput;

  before(async () => {
    token = generateToken(1, false);
  });

  beforeEach(() => {
    input = {
      name: 'User Test One',
      email: 'usertestone@taqtile.com.br',
      password: 'GoodPassword123',
      birthdate: '2000-01-01',
    };
  });

  afterEach(async () => {
    await User.delete({ email: input.email });
  });

  it('Should insert an user into the database', async () => {
    const result = await connection.post(
      '/graphql',
      { query: query, variables: { input } },
      { headers: { Authorization: token } },
    );

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

    await User.delete({ id: user.id });
  });

  it('Should return an error for trying to create an user without passing a token', async () => {
    const result = await connection.post('/graphql', { query: query, variables: { input } });

    expect(result.data.errors[0].message).to.be.eq('No token found');
  });

  it('Should return an error for trying to create an user with a random token', async () => {
    const result = await connection.post(
      '/graphql',
      { query: query, variables: { input } },
      {
        headers: {
          Authorization: 'invalid token',
        },
      },
    );

    expect(result.data.errors[0].additionalInfo).to.be.eq('jwt malformed');
  });

  it('Should return an error for trying to create an user with an invalid token', async () => {
    const result = await connection.post(
      '/graphql',
      { query: query, variables: { input } },
      {
        headers: {
          Authorization:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVqCJ9.eyJpc3MiOiJvbmJvYXJkLW1hcmNvcy1wZXRlci1BUEkiLCJzdWIiOnsiaWQiOjI4LCJuYW1lIjoiTWFyY29zIFBldGVyIiwiZW1haWwiOiJtYXJjb3MucGV0ZXJAdGFxdGlsZS5jb20uYnIifSwiaWF0IjoxNjY2ODI3NDIxLCJleHAiOjE2NjY5MTM4MjF9.WBaxagf6qcgiTGrLKBHmkxQXxffWF0UnNh_oJidUf7ws',
        },
      },
    );

    expect(result.data.errors[0].additionalInfo).to.be.eq('invalid token');
  });

  it('Should return an error for trying to create an user with an existing email', async () => {
    const newUser = Object.assign(new User(), { ...input, password: await crypt.encrypt(input.password) });

    await User.save(newUser);

    const result = await connection.post(
      '/graphql',
      { query: query, variables: { input } },
      { headers: { Authorization: token } },
    );

    expect(result.data.errors).to.be.deep.eq([
      {
        message: 'Email already registered.',
        code: 409,
      },
    ]);
  });

  it('Should return an error for trying to create an user with an invalid password', async () => {
    input.password = 'WrongPassword';
    const result = await connection.post(
      '/graphql',
      { query: query, variables: { input } },
      { headers: { Authorization: token } },
    );

    expect(result.data.errors).to.be.deep.eq([
      {
        message:
          'Password must have between 8 and 16 characters long and must have at least one uppercase, one lowercase letter and one digit.',
        code: 401,
      },
    ]);
  });

  it('Should return an error for trying to create an user with an short name', async () => {
    input.name = 'Us';
    const result = await connection.post(
      '/graphql',
      { query: query, variables: { input } },
      { headers: { Authorization: token } },
    );

    expect(result.data.errors).to.be.deep.eq([
      {
        message: 'Name must have at least 3 characters.',
        code: 401,
      },
    ]);
  });

  it('Should return an error for trying to create an user with an only spaces name', async () => {
    input.name = '        ';
    const result = await connection.post(
      '/graphql',
      { query: query, variables: { input } },
      { headers: { Authorization: token } },
    );

    expect(result.data.errors).to.be.deep.eq([
      {
        message: 'Name cannot be empty.',
        code: 401,
      },
    ]);
  });

  it('Should return an error for trying to create an user with an invalide birthdate', async () => {
    input.birthdate = '2000-13-00';
    const result = await connection.post(
      '/graphql',
      { query: query, variables: { input } },
      { headers: { Authorization: token } },
    );

    expect(result.data.errors).to.be.deep.eq([
      {
        message: 'Birthdate must be a valid date.',
        code: 401,
      },
    ]);
  });
});
