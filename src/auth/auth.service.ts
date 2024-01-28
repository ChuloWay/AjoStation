import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import { UtilityService } from 'src/util/utilityService';
import { JwtPayloadService } from './strategy/jwt-payload';
import { LoginUserDTO } from './dto/login-auth.dto';
import { ForgotPasswordDTO } from './dto/forgot-password.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ResetPasswordDTO } from './dto/reset-password.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtPayloadService: JwtPayloadService,
    private readonly utilityService: UtilityService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async createUser(createUserDTO: CreateUserDto) {
    const { email, phoneNumber } = createUserDTO;

    const checkEmail = await this.userService.findOneByEmail(email);
    if (checkEmail) {
      throw new HttpException(
        'An account with this email address already exists.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const checkNumber = await this.userService.findOneByPhoneNumber(
      phoneNumber,
    );
    if (checkNumber) {
      throw new HttpException(
        'An account with this phoneNumber address already exists.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.userService.create(createUserDTO);
  }

  async login(loginUserDTO: LoginUserDTO) {
    // Get user information
    const user = await this.userService.findOneByEmail(loginUserDTO.email);
    // Check if user exists
    if (!user) {
      throw new NotFoundException('Email does not exist');
    }

    const isValid = await this.utilityService.comparePassword(
      loginUserDTO.password,
      user.password,
    );
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { id, email } = user;
    const data = { id, email };

    delete user.password, delete user.pin;

    const token = this.jwtPayloadService.createToken(data);
    return { user, token };
  }

  public async forgotPassword(
    forgotPasswordDTO: ForgotPasswordDTO,
  ): Promise<void> {
    const { email } = forgotPasswordDTO;
    const resetToken = uuidv4();

    const key = `reset-token:${resetToken}`;
    await this.cacheManager.set(key, email, 900000);

    //TODO -- Mail Service : Send mail to user email provided with the reset token

    Logger.log('token here', resetToken);
  }

  public async resetPassword(
    resetPasswordDTO: ResetPasswordDTO,
  ): Promise<void> {
    const { resetToken, newPassword } = resetPasswordDTO;

    const key = `reset-token:${resetToken}`;
    const email = await this.cacheManager.get<string>(key);

    if (!email) {
      throw new HttpException(
        'Invalid or expired reset token',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userService.updatePassword(user.id, newPassword);

    // Clear the reset token from the cache after use
    await this.cacheManager.del(key);
  }
}
