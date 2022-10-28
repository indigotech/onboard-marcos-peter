import * as jwt from 'jsonwebtoken';
import { CustomError } from '../errors/error-formatter';

export function generateToken(id: number, rememberMe: boolean): string {
  const token = jwt.sign({ iss: 'onboard-marcos-peter-API', sub: { id: id } }, process.env.JWT_SECRET, {
    expiresIn: rememberMe ? process.env.JWT_REMEMBER_ME : process.env.JWT_EXPIRES_IN,
  });

  return token;
}

export function verifyToken(token: string) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  return decoded;
}

export function getUserId(authToken: string) {
  const verifiedToken = authToken && verifyToken(authToken.replace('Bearer ', ''));

  if (!verifiedToken) {
    throw new CustomError('No token found', 401);
  }

  return verifiedToken.sub.id;
}
