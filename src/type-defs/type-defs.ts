import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Query {
    users: [User]!
    hello: String!
  }

  type User {
    id: Int!
    name: String!
    email: String!
    birthdate: String!
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
  }

  type Mutation {
    createUser(userData: UserInput!): User!
    login(login: LoginInput): LoggedUser!
  }
`;
