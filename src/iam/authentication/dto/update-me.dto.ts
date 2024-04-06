import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MinLength } from 'class-validator';

export class UpdateMeDto {
  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  @MinLength(6)
  username: string;

  @ApiProperty()
  @IsEmail()
  email: string;
}
