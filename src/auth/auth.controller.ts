import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Next,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginUserDTO } from './dto/login-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('/register')
  async registerUser(
    @Req() req,
    @Res() res,
    @Body() body: CreateUserDto,
    @Next() next,
  ) {
    try {
      const user = await this.authService.createUser(body);
      return res.status(HttpStatus.CREATED).json({
        statusCode: HttpStatus.OK,
        data: user,
        message: 'success',
      });
    } catch (error) {
      next(error);
    }
  }

  @Post('login')
  async login(@Body() body: LoginUserDTO) {
    try {
      const user = await this.authService.login(body);
      return user;
    } catch (error) {
      throw new HttpException(
        'Reason: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
