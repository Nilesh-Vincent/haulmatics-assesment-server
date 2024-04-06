import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MinLength } from 'class-validator';

export class SignUpDto {
  @ApiProperty()
  @MinLength(6)
  username: string;

  @ApiProperty()
  @MinLength(6)
  firstName: string;

  @ApiProperty()
  @MinLength(6)
  lastName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @MinLength(8)
  password: string;
}
