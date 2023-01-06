import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreateCustomerUserDTO, CreateEventOrganizerUserDTO, LoginDTO, SuccessfulRegisterDTO } from './dto/user.dto';
import { UserService } from './user.service';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private userService: UserService, private readonly configService: ConfigService) {}

  @Post('registerCustomer')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: SuccessfulRegisterDTO })
  @ApiConflictResponse({ description: 'Email or Phone number already in use' })
  async registerCustomer(@Body() dto: CreateCustomerUserDTO) {
    return this.userService.registerCustomerUser(dto);
  }

  @Post('registerEventOrganizer')
  @HttpCode(HttpStatus.CREATED)
  @ApiConflictResponse({ description: 'Email or Phone number already in use' })
  @ApiCreatedResponse({ type: SuccessfulRegisterDTO })
  async registerEventOrganizer(@Body() dto: CreateEventOrganizerUserDTO) {
    return this.userService.registerEventOrganizerUser(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: SuccessfulRegisterDTO })
  @ApiUnauthorizedResponse({ description: 'Incorrect username or password' })
  async login(@Body() dto: LoginDTO) {
    return this.userService.login(dto.phoneNumber, dto.password);
  }
}
