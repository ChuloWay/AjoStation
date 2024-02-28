import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { JwtPayloadService } from './strategy/jwt-payload';
import { UtilityService } from 'src/util/utilityService';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

const mockCacheManager = {
  add: jest.fn().mockResolvedValue({}),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
