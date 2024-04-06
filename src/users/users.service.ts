import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  async findAll() {
    return await this.usersRepo.find({ select: ['id', 'username', 'email', 'role'] });
  }

  async findOne(id: number) {
    return await this.usersRepo.find({ where: { id }, select: ['id', 'username', 'email', 'role'] });
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    return await this.usersRepo.remove(user);  }
}
