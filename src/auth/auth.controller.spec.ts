import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { UtilityService } from 'src/util/utilityService';
import { JwtPayloadService } from './strategy/jwt-payload';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PrismaService } from 'src/prisma/prisma.service';

const mockCacheManager = {
  add: jest.fn().mockResolvedValue({}),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        UserService,
        JwtPayloadService,
        UtilityService,
        PrismaService,
        JwtService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
