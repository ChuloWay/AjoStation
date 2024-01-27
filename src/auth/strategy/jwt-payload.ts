import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtPayloadService {
  constructor(private readonly jwtService: JwtService) {}

  createToken(payload: any) {
    try {
      return this.jwtService.sign(payload);
    } catch (error) {
      throw new HttpException('Cant create token', HttpStatus.UNAUTHORIZED);
    }
  }
  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new HttpException(
        'Verification Token has expired or is invalid',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
