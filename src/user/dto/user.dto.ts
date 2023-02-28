import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEmail, IsNumber, IsString, Length, Matches } from 'class-validator';
import { Role } from 'common/roles';
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

  @ApiProperty()
  profileImage: File | string;
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

  @ApiProperty()
  @IsString()
  verificationStatus: Verification;

  @ApiProperty()
  profileImage: File | string;
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
export class UserGeneralInfoDTO {
  phoneNumber: string;
  email: string;
  username: string;
  verificationStatus: Verification;
  accountType: Role;
  firstName?: string;
  lastName?: string;
  organizationName?: string;
  profileImage?: string;
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

  @ApiProperty({ type: UserGeneralInfoDTO })
  user: UserGeneralInfoDTO;
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
