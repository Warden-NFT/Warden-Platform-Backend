import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '../../common/roles';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  generateJWT(userId: string, role: Role) {
    return this.jwtService.sign({ userId, role });
  }

  generateCustomJWT(payload, signOptions?: JwtSignOptions) {
    return this.jwtService.sign(payload, signOptions);
  }

  verifyJWT(jwt) {
    return this.jwtService.verify(jwt);
  }

  async hashPassword(password: string) {
    return await bcrypt.hash(password, Number(process.env.HASH_SALT));
  }

  async comparePassword(data: string, encrypted: string) {
    return await bcrypt.compare(data, encrypted);
  }
}
