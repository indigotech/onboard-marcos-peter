import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Query {
    user(id: Int!): User!
    users(input: Pagination): UsersListOutput
    hello: String!
  }

  type User {
    id: Int!
    name: String!
    email: String!
    birthdate: String!
    addresses: [Address]
  }

  type Address {
    id: Int!
    cep: String!
    street: String!
    streetNumber: String!
    complement: String
    neighborhood: String!
    city: String!
    state: String!
  }

  type UsersListOutput {
    totalUsers: Int
    before: Int
    after: Int
    users: [User]
  }

  type LoggedUser {
    user: User!
    token: String!
  }

  input UserInput {
    name: String!
    email: String!
    password: String!
    birthdate: String!
  }

  input LoginInput {
    email: String!
    password: String!
    rememberMe: Boolean
  }

  input Pagination {
    limit: Int
    skip: Int
  }

  type Mutation {
    createUser(userData: UserInput!): User!
    login(login: LoginInput): LoggedUser!
  }
`;
