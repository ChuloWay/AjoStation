import {
  IsString,
  IsNotEmpty,
  IsUUID,
  MinLength,
  Matches,
} from 'class-validator';

export class ResetPasswordDTO {
  @IsNotEmpty({ message: 'Reset token is required' })
  @IsUUID(undefined, { message: 'Invalid reset token format' })
  resetToken: string;

  @IsNotEmpty({ message: 'New password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,30}$/, {
    message: 'Invalid password format',
  })
  newPassword: string;
}
