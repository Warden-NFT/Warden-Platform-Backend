import { Body, Controller, Post, Get, Param, HttpCode, ValidationPipe, UsePipes } from '@nestjs/common';
import { OtpService } from './otp.service';
import { ApiParam, ApiBody, ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { RequestOtpResponseDTO, VerifyOtpDTO } from './otp.dto';

@Controller('otp')
export class OtpController {
  constructor(private otpService: OtpService) {}

  @ApiParam({ name: 'phoneNumber', type: String, description: "user's phone number" })
  @ApiOkResponse({ description: 'OTP Successfully Sent', type: RequestOtpResponseDTO })
  @ApiBadRequestResponse({ description: 'Failed Requesting OTP' })
  @Get('/request/:phoneNumber')
  async getOTP(@Param('phoneNumber') phoneNumber: string) {
    return await this.otpService.getOtp(phoneNumber);
  }

  @ApiBody({ type: VerifyOtpDTO })
  @HttpCode(200)
  @ApiOkResponse({ description: 'Verified Successfully' })
  @ApiBadRequestResponse({ description: 'Failed Verifying OTP' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Post('/verifyOtp')
  async verifyOTP(@Body() body: { token: string; pin: string }) {
    return await this.otpService.verifyOtp(body.token, body.pin);
  }
}
