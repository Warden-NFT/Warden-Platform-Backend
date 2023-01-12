import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEmail, IsNumber, IsString, Length, Matches } from 'class-validator';
import { Verification } from '../user.interface';

@Expose()
export class CreateCustomerUserDTO {
  @ApiProperty()
  @Expose()
  @Length(10, 10)
  @Matches(/^0([0-9]{9})$/, { message: 'the phone number is invalid' })
  phoneNumber: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsString()
  verificationStatus: Verification;
}

@Expose()
export class CreateEventOrganizerUserDTO {
  @ApiProperty()
  @Length(10, 10)
  @Matches(/^0([0-9]{9})$/, { message: 'the phone number is invalid' })
  phoneNumber: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsString()
  organizationName: string;
}

@Expose()
export class LoginDTO {
  @ApiProperty()
  @Length(10, 10)
  @Matches(/^0([0-9]{9})$/, { message: 'the phone number is invalid' })
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  password: string;
}

@Expose()
export class SuccessfulUserModificationDTO {
  @ApiProperty()
  @IsNumber()
  status: number;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty()
  @IsString()
  jwt: string;
}

@Expose()
export class SuccessfulVerificationDTO {
  @ApiProperty()
  @IsNumber()
  status: number;

  @ApiProperty()
  @IsString()
  message: string;
}

@Expose()
export class UpdateVerificationStatusDTO {
  @ApiProperty()
  @IsString()
  verificationStatus: Verification;
}
