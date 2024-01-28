import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDTO {
  @IsNotEmpty()
  @IsEmail()
  @Transform((params) => params.value.toLowerCase())
  email: string;
}
