import { HttpStatus, HttpException, Injectable } from '@nestjs/common';
import { RequestOtpResponseDTO } from './otp.dto';

@Injectable()
export class OtpService {
  async getOtp(phoneNumber: string): Promise<RequestOtpResponseDTO> {
    try {
      const sdk = require('api')('@thaibulksms/v1.0#5alni1epl6dge9p1');
      const res = await sdk.postV2OtpRequest(
        {
          key: process.env.OTP_KEY,
          secret: process.env.OTP_SECRETKEY,
          msisdn: phoneNumber,
        },
        { Accept: 'application/json' },
      );
      return res;
    } catch (err) {
      console.log(err);
      throw new HttpException('Failed Requesting OTP', HttpStatus.BAD_REQUEST);
    }
  }

  async verifyOtp(token: string, pin: string): Promise<{ status: number; message: string }> {
    try {
      const sdk = require('api')('@thaibulksms/v1.0#5alni1epl6dge9p1');
      const res = await sdk.postV2OtpVerify(
        {
          key: process.env.OTP_KEY,
          secret: process.env.OTP_SECRETKEY,
          token: token,
          pin: pin,
        },
        { Accept: 'application/json' },
      );
      return { status: res.status, message: res.message };
    } catch (err) {
      throw new HttpException('Failed Verifying OTP', HttpStatus.UNAUTHORIZED);
    }
  }
}
