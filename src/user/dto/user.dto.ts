import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEmail, IsNumber, IsString, Length, Matches } from 'class-validator';

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
export class SuccessfulLoginDTO {
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
export class SuccessfulRegisterDTO {
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
