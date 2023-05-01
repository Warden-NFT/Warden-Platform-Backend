import { HttpStatus, HttpException, Injectable } from '@nestjs/common';
import { RequestOtpResponseDTO } from './otp.dto';

const sdk = require('api')('@thaibulksms/v1.0#1of51jl4qvzac3');
@Injectable()
export class OtpService {
  async getOtp(phoneNumber: string): Promise<RequestOtpResponseDTO> {
    try {
      const res = await sdk.postV2OtpRequest(
        {
          key: process.env.OTP_KEY,
          secret: process.env.OTP_SECRETKEY,
          msisdn: phoneNumber,
        },
        { accept: 'application/json' },
      );
      return res;
    } catch (err) {
      throw new HttpException('Failed Requesting OTP', HttpStatus.BAD_REQUEST);
    }
  }

  async verifyOtp(token: string, pin: string): Promise<{ status: number; message: string }> {
    try {
      const sdk = require('api')('@thaibulksms/v1.0#1of51jl4qvzac3');
      const res = await sdk.postV2OtpVerify(
        {
          key: process.env.OTP_KEY,
          secret: process.env.OTP_SECRETKEY,
          token: token,
          pin: pin,
        },
        { accept: 'application/json' },
      );
      return { status: res.status, message: res.message };
    } catch (err) {
      throw new HttpException('Failed Verifying OTP', HttpStatus.UNAUTHORIZED);
    }
  }
}
