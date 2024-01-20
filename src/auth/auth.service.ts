import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async createUser(createUserDTO: CreateUserDto) {
    const { email } = createUserDTO;

    // Check if the user with this email exists
    const checkEmail = await this.userService.findOneByEmail(email);
    if (checkEmail) {
      throw new HttpException(
        'An account with this email address already exists.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.userService.create(createUserDTO);
  }
}
