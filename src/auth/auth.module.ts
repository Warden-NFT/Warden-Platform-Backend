import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { CustomerGuard, EventOrganizerGuard, JwtAuthGuard } from './jwt.guard';
import { UserService } from '../user/user.service';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => UserModule),
    StorageModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET_KEY'),
        signOptions: { expiresIn: '30d' },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, CustomerGuard, EventOrganizerGuard, JwtAuthGuard, UserService],
  exports: [AuthService, CustomerGuard, EventOrganizerGuard, JwtAuthGuard],
})
export class AuthModule {}
