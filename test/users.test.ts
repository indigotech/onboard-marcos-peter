import axios from 'axios';
import { expect } from 'chai';
import { User } from '../src/entity/User';
import { generateToken } from '../src/utils';
import { populateDatabase } from '../seed/generate-random-user';

describe('Test users query', () => {
  const connection = axios.create({ baseURL: 'http://localhost:3333/' });
  const query = `query Users($input: Pagination) {
    users(input: $input) {
      totalUsers
      before
      after
      users {
        id
        name
        email
        birthdate
      }
    }
  }`;
  const usersQuantity = 50;
  const defaultLimit = 5;
  const defaultSkip = 0;

  let token: string;
  let skip: number;
  let limit: number;

  before(async () => {
    token = generateToken(1, false);
    await populateDatabase(usersQuantity);
  });

  after(async () => {
    await User.delete({});
  });

  it('Should return the users from database based on the limit parameter', async () => {
    limit = 25;
    const { totalUsers, before, after, users } = (
      await connection.post(
        '/graphql',
        { query, variables: { input: { limit } } },
        { headers: { Authorization: token } },
      )
    ).data.data.users;
    const usersInDatabase = await User.find({ take: limit, order: { name: 'ASC' } });

    expect(totalUsers).to.be.equal(usersQuantity);
    expect(before).to.be.equal(defaultSkip);
    expect(after).to.be.equal(usersQuantity - limit);
    expect(users.length).to.be.equal(limit);
    expect(users.length).to.be.equal(usersInDatabase.length);

    for (let i = 0; i < limit; i++) {
      expect(users[i]).to.be.deep.equal({
        id: users[i].id,
        name: users[i].name,
        email: users[i].email,
        birthdate: users[i].birthdate,
      });
    }
  });

  it('Should return the users from database based on the limit and skip parameters', async () => {
    limit = 30;
    skip = 15;
    const { totalUsers, before, after, users } = (
      await connection.post(
        '/graphql',
        { query, variables: { input: { limit, skip } } },
        { headers: { Authorization: token } },
      )
    ).data.data.users;
    const usersInDatabase = await User.find({ skip, take: limit, order: { name: 'ASC' } });

    expect(totalUsers).to.be.deep.equal(usersQuantity);
    expect(before).to.be.deep.equal(skip);
    expect(after).to.be.deep.equal(usersQuantity - (skip + limit));
    expect(users.length).to.be.deep.equal(limit);
    expect(users.length).to.be.deep.equal(usersInDatabase.length);

    for (let i = 0; i < limit; i++) {
      expect(users[i]).to.be.deep.equal({
        id: users[i].id,
        name: users[i].name,
        email: users[i].email,
        birthdate: users[i].birthdate,
      });
    }
  });

  it('Should return the users from database with default values of skip and limit', async () => {
    const { totalUsers, before, after, users } = (
      await connection.post('/graphql', { query, variables: { input: {} } }, { headers: { Authorization: token } })
    ).data.data.users;

    const usersInDatabase = await User.find({ take: defaultLimit, order: { name: 'ASC' } });

    expect(totalUsers).to.be.deep.equal(usersQuantity);
    expect(before).to.be.deep.equal(defaultSkip);
    expect(after).to.be.deep.equal(usersQuantity - (defaultSkip + defaultLimit));
    expect(users.length).to.be.deep.equal(usersInDatabase.length);

    for (let i = 0; i < defaultLimit; i++) {
      expect(users[i]).to.be.deep.equal({
        id: users[i].id,
        name: users[i].name,
        email: users[i].email,
        birthdate: users[i].birthdate,
      });
    }
  });

  it('Should return an error for trying to pass a negative limit value', async () => {
    limit = -3;

    const { errors } = (
      await connection.post(
        '/graphql',
        { query, variables: { input: { limit } } },
        { headers: { Authorization: token } },
      )
    ).data;

    expect(errors).to.be.deep.eq([
      {
        message: 'Internal Server Error',
        code: 500,
        additionalInfo: 'LIMIT must not be negative',
      },
    ]);
  });

  it('Should return an error for trying to pass a negative skip value', async () => {
    skip = -5;

    const { errors } = (
      await connection.post(
        '/graphql',
        { query, variables: { input: { skip } } },
        { headers: { Authorization: token } },
      )
    ).data;

    expect(errors).to.be.deep.eq([
      {
        message: 'Internal Server Error',
        code: 500,
        additionalInfo: 'OFFSET must not be negative',
      },
    ]);
  });

  it('Should return and error for trying to pass a skip value greater than the number of users in database', async () => {
    skip = 65;

    const { errors } = (
      await connection.post(
        '/graphql',
        { query, variables: { input: { skip } } },
        { headers: { Authorization: token } },
      )
    ).data;

    expect(errors).to.be.deep.eq([
      {
        message: 'No users found',
        code: 404,
      },
    ]);
  });

  it('Should return an error for trying to execute the query without passing a token', async () => {
    const result = await connection.post('graphql', { query: query, variables: { input: {} } });

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
      { query: query, variables: { input: {} } },
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
      { query: query, variables: { input: {} } },
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
