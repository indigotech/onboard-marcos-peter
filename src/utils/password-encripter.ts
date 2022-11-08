import * as bcrypt from 'bcrypt';
export class PasswordEncripter {
  public async encrypt(password: string): Promise<string> {
    return bcrypt.hash(password, Number(process.env.HASH_SALT));
  }

  public async isEqual(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
