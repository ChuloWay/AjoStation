import {
  Body,
  Controller,
  HttpStatus,
  Next,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

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
}
