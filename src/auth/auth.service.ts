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

  /**
   * Creates a new user.
   * @param createUserDTO - The DTO containing user data to create.
   * @returns A promise that resolves to the created user.
   * @throws An HttpException if the email or phone number already exists.
   */
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

  /**
   * Logs in a user.
   * @param loginUserDTO - The DTO containing login credentials.
   * @returns A promise that resolves to an object containing the user and authentication token.
   * @throws A NotFoundException if the email is not found.
   * @throws An UnauthorizedException if the password is invalid.
   */
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

  /**
   * Resets the user's password using the reset token.
   * @param resetPasswordDTO - The DTO containing the reset token and new password.
   * @returns A promise that resolves once the password is reset.
   * @throws An HttpException if the reset token is invalid or expired.
   * @throws A NotFoundException if the user associated with the email is not found.
   */
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

    await this.cacheManager.del(key);
  }
}
