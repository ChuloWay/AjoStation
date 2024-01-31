import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '@prisma/client';
import { UtilityService } from '../util/utilityService';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly utilityService: UtilityService,
  ) {}

  public async findUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  public async findOneByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  public async findOneByPhoneNumber(phoneNumber: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { phoneNumber } });
  }

  public async findAll(): Promise<User[] | null> {
    return await this.prisma.user.findMany();
  }

  /**
   * Creates a new user.
   * @param createUserDto - The DTO containing user data to create.
   * @returns A promise that resolves to the created user or null if creation fails.
   */
  public async create(createUserDto: CreateUserDto): Promise<User | null> {
    const hashedPassword = await this.utilityService.hashPassword(
      createUserDto.password,
    );

    try {
      const newUser = await this.prisma.$transaction(async (prisma) => {
        const user = await prisma.user.create({
          data: {
            email: createUserDto.email,
            firstName: createUserDto.firstName,
            lastName: createUserDto.lastName,
            password: hashedPassword,
            phoneNumber: createUserDto.phoneNumber,
            pin: this.utilityService.generateFourDigitPin(),
          },
        });

        const account = await prisma.account.create({
          data: {
            balance: 0,
            userId: user.id,
          },
        });

        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: { accountId: account.id },
        });

        return updatedUser;
      });
      delete newUser.password;
      delete newUser.pin;
      return newUser;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves the profile of a user, excluding sensitive information.
   * @param userId - The ID of the user whose profile to retrieve.
   * @returns A promise that resolves to the user's profile or undefined if not found.
   */
  public async getProfile(userId: string): Promise<User | undefined> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        account: true,
      },
    });

    if (user) {
      delete user.password;
      delete user.account?.createdAt;
      delete user.account?.updatedAt;
      delete user.accountId;
      delete user.createdAt;
      delete user.updatedAt;
    }

    return user;
  }

  /**
   * Updates a user's password.
   * @param userId - The ID of the user whose password to update.
   * @param newPassword - The new password to set.
   * @returns A promise that resolves to the updated user.
   */
  public async updatePassword(userId: string, newPassword: string) {
    const hashedPassword = await this.utilityService.hashPassword(newPassword);
    return await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
      },
    });
  }
}
