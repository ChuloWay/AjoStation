import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtPayloadService } from './strategy/jwt-payload';
import { UtilityService } from 'src/util/utilityService';
import { JwtStrategy } from './strategy/jwt-stratgy';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        privateKey: configService.get<string>('PRIVATE_KEY'),
        publicKey: configService.get<string>('PUBLIC_KEY'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
          algorithm: 'RS256',
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot(),
    UserModule,
  ],
  providers: [
    AuthService,
    JwtStrategy,
    JwtPayloadService,
    UtilityService,
    ConfigService,
  ],
  exports: [
    AuthService,
    JwtModule,
    PassportModule,
    JwtStrategy,
    JwtPayloadService,
    ConfigService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
