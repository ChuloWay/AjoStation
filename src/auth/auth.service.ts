import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import { UtilityService } from 'src/util/utilityService';
import { JwtPayloadService } from './strategy/jwt-payload';
import { LoginUserDTO } from './dto/login-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtPayloadService: JwtPayloadService,
    private readonly utilityService: UtilityService,
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

    // Check if the given password matches the saved password
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

    // Generate JWT token
    const token = this.jwtPayloadService.createToken(data);
    return { user, token };
  }
}
