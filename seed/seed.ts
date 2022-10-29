// import * as dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import { User } from '../src/entity/User';
import { PasswordEncripter } from '../src/utils';

export class Seed {
  static async generateRandomUser() {
    const crypt = new PasswordEncripter();

    const user = new User();
    user.name = faker.name.firstName();
    user.email = faker.internet.email();
    user.password = faker.word.noun() + faker.random.numeric(3);
    user.password = await crypt.encrypt(user.password);
    user.birthdate = String(faker.date.past(18));

    return user;
  }
}
