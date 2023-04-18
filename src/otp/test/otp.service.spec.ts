import { Test } from '@nestjs/testing';
import { OtpService } from '../otp.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('OtpService', () => {
  let service: OtpService;
  let sdk: any;

  const mockSdk = {
    postV2OtpRequest: jest.fn().mockResolvedValue({ status: 200, message: 'success' }),
    postV2OtpVerify: jest.fn(),
  };

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      providers: [
        OtpService,
        { provide: 'sdk', useValue: mockSdk }, // mock the SDK here
      ],
    }).compile();

    service = app.get<OtpService>(OtpService);
    sdk = app.get('sdk');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOtp', () => {
    xit('should return a RequestOtpResponseDTO when given a valid phone number', async () => {
      const phoneNumber = '1234567890';
      const mockRes = {
        status: 200,
        token: 'valid-token',
        refno: 'valid-refno',
      };

      jest.spyOn(sdk, 'postV2OtpRequest').mockResolvedValueOnce(mockRes);

      const res = await service.getOtp(phoneNumber);
      expect(res).toBeDefined();
      expect(res.token).toBeDefined();
    });

    it('should throw an HttpException when given an invalid phone number', async () => {
      const phoneNumber = 'invalid-phone-number';
      try {
        await service.getOtp(phoneNumber);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe('Failed Requesting OTP');
        expect(err.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });

  describe('verifyOtp', () => {
    xit('should return a status and message when given a valid token and pin', async () => {
      const token = 'valid-token';
      const pin = 'valid-pin';
      const res = await service.verifyOtp(token, pin);
      expect(res).toBeDefined();
      expect(res.status).toBeDefined();
      expect(res.message).toBeDefined();
    });

    it('should throw an HttpException when given an invalid token or pin', async () => {
      const token = 'invalid-token';
      const pin = 'invalid-pin';
      try {
        await service.verifyOtp(token, pin);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe('Failed Verifying OTP');
        expect(err.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
      }
    });
  });
});
