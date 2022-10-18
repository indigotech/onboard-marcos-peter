import * as bcrypt from 'bcrypt';

export class PasswordEncripter {
  public async encrypt(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  public async isEqual(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
