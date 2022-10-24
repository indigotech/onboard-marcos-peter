import 'mocha';
import axios from 'axios';
import { expect } from 'chai';
import { User } from '../src/entity/User';

const connection = axios.create({ baseURL: 'http://localhost:3333/' });

describe('Test createUser errors', () => {
  it('Should return an error for trying to create an user with an existing email', async () => {
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

    expect(result.data.errors).to.be.deep.eq([
      {
        message: 'Email already registered.',
        code: 409,
      },
    ]);

    await User.delete({ email: input.email });
  });

  it('Should return an error for trying to create an user with an invalid password', async () => {
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
      password: 'GoodPassword',
      birthdate: '2000-01-01',
    };

    const result = await connection.post('/graphql', { query: query, variables: { input } });

    expect(result.data.errors).to.be.deep.eq([
      {
        message:
          'Password must have between 8 and 16 characters long and must have at least one uppercase, one lowercase letter and one digit.',
        code: 401,
      },
    ]);
  });

  it('Should return an error for trying to create an user with an short name', async () => {
    const query = `mutation CreateUser($input: UserInput!) {
      createUser(userData: $input){
        id
        name
        email
        birthdate
      }
    }`;

    const input = {
      name: 'Us',
      email: 'usertesttwo@taqtile.com.br',
      password: 'GoodPassword123',
      birthdate: '2000-01-01',
    };

    const result = await connection.post('/graphql', { query: query, variables: { input } });

    expect(result.data.errors).to.be.deep.eq([
      {
        message: 'Name must have at least 3 characters.',
        code: 401,
      },
    ]);
  });

  it('Should return an error for trying to create an user with an only spaces name', async () => {
    const query = `mutation CreateUser($input: UserInput!) {
      createUser(userData: $input){
        id
        name
        email
        birthdate
      }
    }`;

    const input = {
      name: '         ',
      email: 'usertestthree@taqtile.com.br',
      password: 'GoodPassword123',
      birthdate: '2000-01-01',
    };

    const result = await connection.post('/graphql', { query: query, variables: { input } });

    expect(result.data.errors).to.be.deep.eq([
      {
        message: 'Name cannot be empty.',
        code: 401,
      },
    ]);
  });

  it('Should return an error for trying to create an user with an invalide birthdate', async () => {
    const query = `mutation CreateUser($input: UserInput!) {
      createUser(userData: $input){
        id
        name
        email
        birthdate
      }
    }`;

    const input = {
      name: 'User Test Four',
      email: 'usertestFour@taqtile.com.br',
      password: 'GoodPassword123',
      birthdate: '2000-13-00',
    };

    const result = await connection.post('/graphql', { query: query, variables: { input } });

    expect(result.data.errors).to.be.deep.eq([
      {
        message: 'Birthdate must be a valid date.',
        code: 401,
      },
    ]);
  });
});
