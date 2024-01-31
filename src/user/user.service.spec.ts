import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UtilityService } from '../util/utilityService';
import { Account, User } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

/**
 * Describes the tests for the UserService.
 */
describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;
  let utilityService: UtilityService;

  /**
   * Mock user data for testing.
   */
  const mockUsers: User[] = [
    {
      id: uuidv4(),
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phoneNumber: '1234567890',
      pin: '1234',
      password: 'password',
      accountId: 'accountId',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: uuidv4(),
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      phoneNumber: '9876543210',
      pin: '5678',
      password: 'password2',
      accountId: 'accountId2',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const oneUser = mockUsers[0];

  /**
   * Before each test case, initialize the TestingModule.
   */
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, PrismaService, UtilityService],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
    utilityService = module.get<UtilityService>(UtilityService);
  });

  /**
   * Tests if the UserService is defined.
   */
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /**
   * Tests if findAll method returns an array of users.
   */
  describe('findAll', () => {
    it('should return an array of users', async () => {
      jest.spyOn(prisma.user, 'findMany').mockResolvedValue(mockUsers);

      const users = await service.findAll();
      expect(users).toEqual(mockUsers);
    });
  });

  /**
   * Tests if findUserById method gets a single user.
   */
  describe('findUserById', () => {
    it('should get a single user', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(oneUser);

      expect(service.findUserById('a uuid')).resolves.toEqual(oneUser);
    });
  });

  /**
   * Tests if getProfile method returns user profile without sensitive information.
   */
  it('should return user profile without sensitive information', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(oneUser);

    const userProfile = await service.getProfile(oneUser.id);

    expect(userProfile).toEqual(oneUser);

    expect(userProfile?.password).toBeUndefined();
    expect(userProfile?.accountId).toBeUndefined();
    expect(userProfile?.createdAt).toBeUndefined();
    expect(userProfile?.updatedAt).toBeUndefined();
  });

  /**
   * Tests if create method creates a new user.
   */
  it('should create a new user', async () => {
    const uniqueEmail = `test-${uuidv4()}@example.com`;
    const uniquePhoneNumber = `+1234567${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0')}`;
    const createUserDto: CreateUserDto = {
      email: uniqueEmail,
      firstName: 'John',
      lastName: 'Doe',
      password: 'password',
      phoneNumber: uniquePhoneNumber,
    };

    const hashedPassword = 'hashedPassword';
    const generatedPin = '1234';

    const accountId = uuidv4();
    const id = uuidv4();

    const newUser: User = {
      id,
      email: createUserDto.email,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      password: hashedPassword,
      phoneNumber: createUserDto.phoneNumber,
      pin: generatedPin,
      accountId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newAccount: Account = {
      id: accountId,
      userId: id,
      balance: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.spyOn(prisma.user, 'create').mockResolvedValue(newUser);
    jest.spyOn(prisma.account, 'create').mockResolvedValue(newAccount);
    jest.spyOn(prisma.user, 'update').mockResolvedValue(newUser);

    jest
      .spyOn(utilityService, 'hashPassword')
      .mockResolvedValue(hashedPassword);
    jest
      .spyOn(utilityService, 'generateFourDigitPin')
      .mockReturnValue(generatedPin);

    const createdUser = await service.create(createUserDto);

    expect(createdUser).toEqual({
      id: expect.any(String),
      email: createUserDto.email,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      phoneNumber: createUserDto.phoneNumber,
      accountId: expect.any(String),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });

    expect(createdUser.password).toBeUndefined();
    expect(createdUser.pin).toBeUndefined();
  });
});
