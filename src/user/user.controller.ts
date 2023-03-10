import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { FILE_SIZES } from 'src/utils/constants';
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
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        files: 1,
        fileSize: FILE_SIZES.TEN_MEGABYTES,
      },
    }),
  )
  async registerCustomer(@Body() dto: CreateCustomerUserDTO, @UploadedFile() image: Express.Multer.File) {
    return this.userService.registerCustomerUser(dto, image);
  }

  @Post('registerEventOrganizer')
  @HttpCode(HttpStatus.CREATED)
  @ApiConflictResponse({ description: 'Email or Phone number already in use' })
  @ApiCreatedResponse({ type: SuccessfulUserModificationDTO })
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        files: 1,
        fileSize: FILE_SIZES.TEN_MEGABYTES,
      },
    }),
  )
  async registerEventOrganizer(@Body() dto: CreateEventOrganizerUserDTO, @UploadedFile() image: Express.Multer.File) {
    return this.userService.registerEventOrganizerUser(dto, image);
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
