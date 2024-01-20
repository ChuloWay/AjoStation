import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma.service';
import { User } from '@prisma/client';
import { UtilityService } from 'src/util/utilityService';

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

  public async findAll(): Promise<User[] | null> {
    return await this.prisma.user.findMany();
  }

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
      console.error('Error creating user and account:', error);
      throw error;
    }
  }
}
