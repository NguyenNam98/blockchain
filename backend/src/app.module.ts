import {
  DynamicModule,
  Global,
  MiddlewareConsumer,
  Module,
} from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { RATE_LIMIT_DEFAULT } from 'app.constant'
import { XssProtectionMiddleware } from './middlewares/xssProtection'
import {GoogleDriveService} from "./services/ggDriver.service";
import {DatabaseModule} from "./database.module";
import {ProfileKeyService} from "./services/profileKey.service";
import {EncryptionService} from "./services/crypto.service";
@Global()
@Module({})
export class AppModule {
  static forRoot(modules): DynamicModule {
    return {
      module: AppModule,
      imports: [
        HttpModule,
          DatabaseModule.forRoot(),
        ...modules,
        ThrottlerModule.forRoot({
          limit: RATE_LIMIT_DEFAULT.LIMIT,
          ttl: RATE_LIMIT_DEFAULT.TTL,
          ignoreUserAgents: [/(Chrome-Lighthouse|bot)/i],
        }),
      ],
      providers: [
        {
          provide: APP_GUARD,
          useClass: ThrottlerGuard,
        },
        GoogleDriveService,
        ProfileKeyService,
        EncryptionService
      ],
      exports: [
        GoogleDriveService,
        ProfileKeyService,
        EncryptionService
      ],
    }
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(XssProtectionMiddleware).forRoutes('/api/*')
  }
}
