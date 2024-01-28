import {
  Controller,
  Get,
  HttpStatus,
  Next,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/strategy/jwt-guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getUserProfile(@Req() req, @Res() res, @Next() next) {
    try {
      const userObject = req.user;
      const user = await this.userService.getProfile(userObject.id);
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        data: user,
        message: 'User Profile',
      });
    } catch (error) {
      next(error);
    }
  }
}
