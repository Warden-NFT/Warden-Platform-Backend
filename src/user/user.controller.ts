import { Body, Controller, Get, HttpCode, HttpStatus, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import {
  CreateCustomerUserDTO,
  CreateEventOrganizerUserDTO,
  LoginDTO,
  SuccessfulUserModificationDTO,
  SuccessfulVerificationDTO,
  UpdateVerificationStatusDTO,
  UserGeneralInfoDTO,
} from './dto/user.dto';
import { UserService } from './user.service';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private userService: UserService, private readonly configService: ConfigService) {}

  @Post('registerCustomer')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: SuccessfulUserModificationDTO })
  @ApiConflictResponse({ description: 'Email or Phone number already in use' })
  async registerCustomer(@Body() dto: CreateCustomerUserDTO) {
    return this.userService.registerCustomerUser(dto);
  }

  @Post('registerEventOrganizer')
  @HttpCode(HttpStatus.CREATED)
  @ApiConflictResponse({ description: 'Email or Phone number already in use' })
  @ApiCreatedResponse({ type: SuccessfulUserModificationDTO })
  async registerEventOrganizer(@Body() dto: CreateEventOrganizerUserDTO) {
    return this.userService.registerEventOrganizerUser(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: SuccessfulUserModificationDTO })
  @ApiUnauthorizedResponse({ description: 'Incorrect username or password' })
  async login(@Body() dto: LoginDTO) {
    return this.userService.login(dto.phoneNumber, dto.password);
  }

  @Put('setVerificationStatus')
  @ApiOkResponse({ type: SuccessfulVerificationDTO })
  @ApiNotFoundResponse({ description: `User id not found` })
  @UseGuards(JwtAuthGuard)
  async updateVerificationStatus(@Req() req, @Body() dto: UpdateVerificationStatusDTO) {
    return this.userService.setUserPhoneVerificationStatus(req.user.uid, dto.verificationStatus);
  }

  @Get()
  @ApiOkResponse({ type: UserGeneralInfoDTO })
  @ApiNotFoundResponse({ description: `User id not found` })
  @UseGuards(JwtAuthGuard)
  async getUserInfo(@Req() req) {
    return this.userService.getUserInfo(req.user.uid);
  }
}
