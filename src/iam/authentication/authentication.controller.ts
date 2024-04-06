import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch, Post } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { AuthType } from './enums/auth-type.enum';
import { Auth } from './decorators/auth.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ActiveUser } from '../decorators/active-user.decorator';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateMeDto } from './dto/update-me.dto';

@Auth(AuthType.None)
@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto) {
    return await this.authService.signUp(signUpDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async signIn(@Body() signInDto: SignInDto) {
    return await this.authService.signIn(signInDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh-tokens')
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto);
  }

  @Auth(AuthType.Bearer)
  @Post('change-password')
  async changePassword(
    @ActiveUser() user: ActiveUserData,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const userId = user.sub;
    const token = await this.authService.changePassword(
      userId,
      changePasswordDto,
    );
    return token;
  }

  @Auth(AuthType.Bearer)
  @Delete('delete-account')
  async deleteAccount(@ActiveUser() user: ActiveUserData) {
    const userId = user.sub;
    await this.authService.deleteAccount(userId);
  }

  @Auth(AuthType.Bearer)
  @Get('get-me')
  async getMe(@ActiveUser() user: ActiveUserData) {
    const userId = user.sub;
    return await this.authService.getMe(userId)
  }

  @Auth(AuthType.Bearer)
  @Patch('update-me')
  async editMe(@ActiveUser() user: ActiveUserData, @Body() editMeDto: UpdateMeDto) {
    const userId = user.sub;
    return await this.authService.editMe(userId, editMeDto);
  }
}
