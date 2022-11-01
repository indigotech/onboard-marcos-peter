import axios from 'axios';
import { expect } from 'chai';
import { User } from '../src/entity/User';
import { generateToken, PasswordEncripter } from '../src/utils';
import { UserInput } from '../src/models/user-models';

describe('Test createUser Mutation', () => {
  const connection = axios.create({ baseURL: 'http://localhost:3333/' });
  const crypt = new PasswordEncripter();
  const query = `mutation CreateUser($userTestInput: UserInput!) {
    createUser(userData: $userTestInput){
      id
      name
      email
      birthdate
    }
  }`;

  let token: string;
  let userTestInput: UserInput;

  before(async () => {
    token = generateToken(1, false);
  });

  beforeEach(async () => {
    userTestInput = {
      name: 'User Test One',
      email: 'usertestone@taqtile.com.br',
      password: 'GoodPassword123',
      birthdate: '2000-01-01',
    };
  });

  afterEach(async () => {
    await User.delete({ email: userTestInput.email });
  });

  it('Should insert an user into the database', async () => {
    const result = await connection.post(
      '/graphql',
      { query: query, variables: { userTestInput } },
      { headers: { Authorization: token } },
    );

    const user = await User.findOneBy({ email: userTestInput.email });

    const passwordsMatch = await crypt.isEqual(userTestInput.password, user.password);

    expect(user.id).to.be.gt(0);
    expect(user.name).to.be.deep.eq(userTestInput.name);
    expect(user.email).to.be.deep.eq(userTestInput.email);
    expect(passwordsMatch).to.be.true;
    expect(user.birthdate).to.be.deep.eq(userTestInput.birthdate);
    expect(result.data.data.createUser).to.be.deep.eq({
      id: user.id,
      name: userTestInput.name,
      email: userTestInput.email,
      birthdate: userTestInput.birthdate,
    });

    await User.delete({ id: user.id });
  });

  it('Should return an error for trying to create an user without passing a token', async () => {
    const result = await connection.post('/graphql', { query: query, variables: { userTestInput } });

    expect(result.data.errors[0]).to.be.deep.eq({
      message: 'No token found',
      code: 401,
    });
  });

  it('Should return an error for trying to create an user with a random token', async () => {
    const result = await connection.post(
      '/graphql',
      { query: query, variables: { userTestInput } },
      {
        headers: {
          Authorization: 'invalid token',
        },
      },
    );

    expect(result.data.errors[0]).to.be.deep.eq({
      message: 'Internal Server Error',
      code: 500,
      additionalInfo: 'jwt malformed',
    });
  });

  it('Should return an error for trying to create an user with an invalid token', async () => {
    const result = await connection.post(
      '/graphql',
      { query: query, variables: { userTestInput } },
      {
        headers: {
          Authorization:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVqCJ9.eyJpc3MiOiJvbmJvYXJkLW1hcmNvcy1wZXRlci1BUEkiLCJzdWIiOnsiaWQiOjI4LCJuYW1lIjoiTWFyY29zIFBldGVyIiwiZW1haWwiOiJtYXJjb3MucGV0ZXJAdGFxdGlsZS5jb20uYnIifSwiaWF0IjoxNjY2ODI3NDIxLCJleHAiOjE2NjY5MTM4MjF9.WBaxagf6qcgiTGrLKBHmkxQXxffWF0UnNh_oJidUf7ws',
        },
      },
    );

    expect(result.data.errors[0]).to.be.deep.eq({
      message: 'Internal Server Error',
      code: 500,
      additionalInfo: 'invalid token',
    });
  });

  it('Should return an error for trying to create an user with an existing email', async () => {
    const newUser = Object.assign(new User(), {
      ...userTestInput,
      password: await crypt.encrypt(userTestInput.password),
    });

    await User.save(newUser);

    const result = await connection.post(
      '/graphql',
      { query: query, variables: { userTestInput } },
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
    userTestInput.password = 'WrongPassword';
    const result = await connection.post(
      '/graphql',
      { query: query, variables: { userTestInput } },
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
    userTestInput.name = 'Us';
    const result = await connection.post(
      '/graphql',
      { query: query, variables: { userTestInput } },
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
    userTestInput.name = '         ';
    const result = await connection.post(
      '/graphql',
      { query: query, variables: { userTestInput } },
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
    userTestInput.birthdate = '2000-13-00';
    const result = await connection.post(
      '/graphql',
      { query: query, variables: { userTestInput } },
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
