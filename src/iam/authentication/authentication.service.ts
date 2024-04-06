import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../users/entities/user.entity';
import { Repository } from 'typeorm';
import { HashingService } from '../hashing/hashing.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt-config';
import { ConfigType } from '@nestjs/config';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RefreshTokenIdsStorage } from './refresh-token-ids.storage';
import { randomUUID } from 'crypto';
import { InvalidatedRefreshTokenError } from './refresh-token-ids.storage';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateMeDto } from './dto/update-me.dto';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfigurtion: ConfigType<typeof jwtConfig>,
    private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    try {
      const user = new User();
      user.email = signUpDto.email;
      user.username = signUpDto.username;
      user.firstName = signUpDto.firstName;
      user.lastName = signUpDto.lastName
      user.username = signUpDto.username;
      user.password = await this.hashingService.hash(signUpDto.password);

      await this.usersRepo.save(user);
    } catch (error) {
      if (error.code === '23505') throw new ConflictException();
      throw error;
    }
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.usersRepo.findOne({
      where: { username: signInDto.username },
    });

    if (!user) {
      throw new UnauthorizedException('User Does Not Exists');
    }

    const isEqual = await this.hashingService.compare(
      signInDto.password,
      user.password,
    );

    if (!isEqual) {
      throw new UnauthorizedException('Password Does Not Match');
    }

    return await this.generateTokens(user);
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException('User Does Not Exist');
    }

    const isEqual = await this.hashingService.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isEqual) {
      throw new UnauthorizedException('Current Password is Incorrect');
    }

    user.password = await this.hashingService.hash(
      changePasswordDto.newPassword,
    );

    await this.usersRepo.save(user);
    return this.generateTokens(user);
  }

  async deleteAccount(userId: number) {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User Does Not Exist');
    }

    await this.usersRepo.remove(user);
    return { message: 'User account deleted successfully' };
  }

  async getMe(userId: number) {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User Does Not Exist');
    }
    const { password, ...rest } = user;
    return rest;
  }

  async editMe(userId: number, editMeDto: UpdateMeDto) {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException('User Does Not Exist');
    }

    if (editMeDto.email) {
      user.email = editMeDto.email;
    }

    if (editMeDto.username) {
      user.username = editMeDto.username;
    }

    if (editMeDto.firstName) {
      user.firstName = editMeDto.firstName;
    }

    if (editMeDto.username) {
      user.lastName = editMeDto.lastName;
    }

    await this.usersRepo.save(user);
    const { password, ...rest } = user;
    return rest;
  }

  public async generateTokens(user: User) {
    const refreshTokenId = randomUUID();
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<ActiveUserData>>(
        user.id,
        this.jwtConfigurtion.accessTokenTtl,
        { username: user.username, email: user.email, role: user.role },
      ),
      this.signToken(user.id, this.jwtConfigurtion.refreshTokenTtl, {
        refreshTokenId,
      }),
    ]);
    await this.refreshTokenIdsStorage.insert(user.id, refreshTokenId);
    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    try {
      const { sub, refreshTokenId } = await this.jwtService.verifyAsync<
        Pick<ActiveUserData, 'sub'> & { refreshTokenId: string }
      >(refreshTokenDto.refreshToken, {
        audience: this.jwtConfigurtion.audience,
        issuer: this.jwtConfigurtion.issuer,
        secret: this.jwtConfigurtion.secret,
      });
      const user = await this.usersRepo.findOneOrFail({
        where: {
          id: sub,
        },
      });
      const isValid = await this.refreshTokenIdsStorage.validate(
        user.id,
        refreshTokenId,
      );

      if (isValid) {
        await this.refreshTokenIdsStorage.invalidate(user.id);
      } else {
        throw new Error('Refresh Token Is Not Valid');
      }

      return this.generateTokens(user);
    } catch (error) {
      if (error instanceof InvalidatedRefreshTokenError) {
        throw new UnauthorizedException('Access Denied');
      }
      throw new UnauthorizedException();
    }
  }

  private async signToken<T>(userId: number, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      },
      {
        audience: this.jwtConfigurtion.audience,
        issuer: this.jwtConfigurtion.issuer,
        secret: this.jwtConfigurtion.secret,
        expiresIn,
      },
    );
  }
}
