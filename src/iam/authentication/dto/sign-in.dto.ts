import { ApiProperty } from '@nestjs/swagger';
import { MinLength } from 'class-validator';

export class SignInDto {
  @ApiProperty()
  @MinLength(6)
  username: string;

  @ApiProperty()
  @MinLength(8)
  password: string;
}
