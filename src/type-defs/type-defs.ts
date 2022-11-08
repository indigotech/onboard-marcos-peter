import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Query {
    user(id: Int!): User!
    users(input: Pagination): UsersListOutput!
    hello: String!
  }

  type User {
    id: Int!
    name: String!
    email: String!
    birthdate: String!
  }

  type UsersListOutput {
    totalUsers: Int!
    before: Int!
    after: Int!
    users: [User]!
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
    limit: Int = 5
    skip: Int = 0
  }

  type Mutation {
    createUser(userData: UserInput!): User!
    login(login: LoginInput): LoggedUser!
  }
`;
