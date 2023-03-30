import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ROLE } from '../../common/roles';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  const HASH_SALT = '10';

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    jwtService = moduleRef.get<JwtService>(JwtService);

    jest.spyOn(jwtService, 'sign').mockReturnValue('1234');
    jest.spyOn(bcrypt, 'hash').mockReturnValue(HASH_SALT);
    jest.spyOn(bcrypt, 'compare').mockReturnValue(true);
  });

  describe('generateJWT', () => {
    it('should call jwtService.sign with correct payload', () => {
      const userId = '123';
      const role = ROLE.ADMIN;

      authService.generateJWT(userId, role);

      expect(jwtService.sign).toHaveBeenCalledWith({ userId, role });
    });

    it('should return a string', () => {
      const userId = '123';
      const role = ROLE.ADMIN;

      const result = authService.generateJWT(userId, role);

      expect(typeof result).toBe('string');
    });
  });

  describe('generateCustomJWT', () => {
    it('should call jwtService.sign with correct payload and options', () => {
      const payload = { foo: 'bar' };
      const signOptions = { expiresIn: '1h' };

      authService.generateCustomJWT(payload, signOptions);

      expect(jwtService.sign).toHaveBeenCalledWith(payload, signOptions);
    });

    it('should return a string', () => {
      const payload = { foo: 'bar' };

      const result = authService.generateCustomJWT(payload);

      expect(typeof result).toBe('string');
    });
  });

  describe('verifyJWT', () => {
    it('should call jwtService.verify with the given jwt', () => {
      const jwt = 'token';

      authService.verifyJWT(jwt);

      expect(jwtService.verify).toHaveBeenCalledWith(jwt);
    });
  });

  describe('hashPassword', () => {
    it('should call bcrypt.hash with the given password and HASH_SALT env variable', async () => {
      const password = 'password';

      process.env.HASH_SALT = HASH_SALT;

      await authService.hashPassword(password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, Number(HASH_SALT));
    });

    it('should return a string', async () => {
      const password = 'password';
      const hashSalt = '10';

      process.env.HASH_SALT = hashSalt;

      const result = await authService.hashPassword(password);

      expect(typeof result).toBe('string');
    });
  });

  describe('comparePassword', () => {
    it('should call bcrypt.compare with the given data and encrypted password', async () => {
      const data = 'password';
      const encrypted = 'encrypted';

      await authService.comparePassword(data, encrypted);

      expect(bcrypt.compare).toHaveBeenCalledWith(data, encrypted);
    });

    it('should return a boolean', async () => {
      const data = 'password';
      const encrypted = 'encrypted';

      const result = await authService.comparePassword(data, encrypted);

      expect(typeof result).toBe('boolean');
    });
  });
});
