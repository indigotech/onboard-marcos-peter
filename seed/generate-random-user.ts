import { faker } from '@faker-js/faker';
import { User } from '../src/entity/User';
import { PasswordEncripter } from '../src/utils';

export async function generateRandomUser() {
  const crypt = new PasswordEncripter();
  const generatedUser = new User();

  generatedUser.name = faker.name.firstName();
  generatedUser.email = faker.internet.email();
  generatedUser.password = await crypt.encrypt(faker.word.noun() + faker.random.numeric(3));
  generatedUser.birthdate = String(faker.date.past(18));

  return generatedUser;
}

export async function populateDatabase(usersQuantity: number) {
  const generatedUsers = [];

  for (let i = 0; i < usersQuantity; i++) {
    generatedUsers.push(await generateRandomUser());
  }

  await User.save(generatedUsers);
}
