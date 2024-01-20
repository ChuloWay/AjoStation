import { IsAlpha, IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsNotEmpty({ message: 'First Name is required' })
  @IsAlpha()
  @IsString()
  firstName: string;

  @IsNotEmpty({ message: 'Last Name is required' })
  @IsAlpha()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  @Transform((params) => params.value.toLowerCase())
  email: string;

  @IsNotEmpty({ message: 'Phone Number is required' })
  phoneNumber: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  password: string;
}
