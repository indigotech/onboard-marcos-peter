export interface UserInput {
  name: string;
  email: string;
  password: string;
  birthdate: string;
}

export interface UserOutput {
  name: string;
  email: string;
  id: number;
  birthdate: string;
  addresses: Address[];
}

export interface Address {
  cep: string;
  street: string;
  streetNumber: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface CreateUserInput {
  userData: UserInput;
}

export interface LoginInput {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginOutput {
  user: UserOutput;
  token: string;
}

export interface Pagination {
  limit?: number;
  skip?: number;
}

export interface UsersListOutput {
  totalUsers: number;
  before: number;
  after: number;
  users: UserOutput[];
}
