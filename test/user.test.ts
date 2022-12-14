import axios from 'axios';
import { expect } from 'chai';
import { User } from '../src/entity/User';
import { generateToken } from '../src/utils';
import { UserInput } from '../src/models/user-models';
import { PasswordEncripter } from '../src/utils';
import { generateRandomAddress } from '../seed/generate-random-address';
import { Address } from '../src/entity/Address';

describe('Test user query', () => {
  const connection = axios.create({ baseURL: 'http://localhost:3333/' });
  const crypt = new PasswordEncripter();
  const query = `query User($createdUserId: Int!){
    user(id: $createdUserId) {
      id
      name
      email
      birthdate
      addresses {
        id
        cep
        street
        streetNumber
        complement
        neighborhood
        city
        state
      }
    }
  }`;

  const userTestInput: UserInput = {
    name: 'User Test One',
    email: 'usertestone@taqtile.com.br',
    password: 'GoodPassword123',
    birthdate: '2000-01-01',
  };

  let createdUser: User;
  let token: string;
  let createdUserId: number;
  let newAddresses: Address[];

  before(async () => {
    token = generateToken(1, false);

    const newUser = Object.assign(new User(), {
      ...userTestInput,
      password: await crypt.encrypt(userTestInput.password),
    });
    newAddresses = [generateRandomAddress(newUser), generateRandomAddress(newUser)];
    newUser.addresses = newAddresses;

    createdUser = await User.save(newUser);

    createdUserId = createdUser.id;
  });

  after(async () => {
    await Address.delete({});
    await User.delete({});
  });

  it('Should return a existent user and its addresses from database', async () => {
    const result = (
      await connection.post(
        '/graphql',
        { query: query, variables: { createdUserId } },
        { headers: { Authorization: token } },
      )
    ).data.data.user;

    const addresses = result.addresses;

    expect(result.addresses.length).to.be.deep.eq(newAddresses.length);
    expect(result).to.be.deep.eq({
      id: createdUser.id,
      name: userTestInput.name,
      email: userTestInput.email,
      birthdate: userTestInput.birthdate,
      addresses: addresses,
    });
  });

  it('Should return an error for trying to find an user with an inexistent id', async () => {
    createdUserId = 0;

    const result = await connection.post(
      'graphql',
      { query: query, variables: { createdUserId } },
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
    const result = await connection.post('graphql', { query: query, variables: { createdUserId } });

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
      { query: query, variables: { createdUserId } },
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
      { query: query, variables: { createdUserId } },
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
