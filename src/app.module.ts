import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StorageModule } from './storage/storage.module';
import { MediaController } from './media/media.controller';
import { MediaModule } from './media/media.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventModule } from './event/event.module';
import { TicketModule } from './ticket/ticket.module';
import { OtpModule } from './otp/otp.module';
import { SmartContractModule } from './smart-contract/smart-contract.module';
import { MarketModule } from './market/market.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: ['.env'] }),
    StorageModule,
    MediaModule,
    AuthModule,
    UserModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),
    EventModule,
    TicketModule,
    OtpModule,
    SmartContractModule,
    MarketModule,
  ],
  controllers: [AppController, MediaController],
  providers: [AppService],
})
export class AppModule {}
