import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { UtilityService } from 'src/util/utilityService';

@Module({
  controllers: [UserController],
  providers: [UserService, UtilityService],
  exports: [UserService],
})
export class UserModule {}
