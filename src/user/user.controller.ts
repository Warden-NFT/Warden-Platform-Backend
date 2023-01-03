import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateCustomerUserDTO, CreateEventOrganizerUserDTO, LoginDTO } from './dto/user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService, private readonly configService: ConfigService) {}

  @Post('registerCustomer')
  @HttpCode(HttpStatus.CREATED)
  async registerCustomer(@Body() dto: CreateCustomerUserDTO) {
    return this.userService.registerCustomerUser(dto);
  }

  @Post('registerEventOrganizer')
  @HttpCode(HttpStatus.CREATED)
  async registerEventOrganizer(@Body() dto: CreateEventOrganizerUserDTO) {
    return this.userService.registerEventOrganizerUser(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.CREATED)
  async login(@Body() dto: LoginDTO) {
    return this.userService.login(dto.phoneNumber, dto.password);
  }
}
