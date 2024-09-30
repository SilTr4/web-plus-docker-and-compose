import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FindOneOptions, QueryFailedError, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { password } = createUserDto;
    const passwordHash = await bcrypt.hash(password, 10);
    try {
      const user = await this.userRepository.save({
        ...createUserDto,
        password: passwordHash,
      });
      delete user.password;
      return user;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const err = error.driverError;
        if (err.code === '23505') {
          throw new ConflictException('username already exist');
        }
      }
    }
  }

  async findOne(id: number) {
    return await this.userRepository.findOneBy({ id: id });
  }

  async updateOne(id: number, updateUserDto: UpdateUserDto) {
    for (const key in updateUserDto) {
      if (key === 'password') {
        const passwordHash = await bcrypt.hash(updateUserDto[key], 10);
        updateUserDto[key] = passwordHash;
      }
    }
    try {
      await this.userRepository.update(id, updateUserDto);
      const user = await this.userRepository.findOneBy({ id: id });
      return user;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const err = error.driverError;
        if (err.code === '23505') {
          throw new ConflictException('username already exist');
        }
      }
    }
  }

  async findByUsername(username: string) {
    const user = await this.userRepository.findOne({
      select: { password: true },
      where: { username: username },
    });
    return user;
  }

  async getUserWishes(username: string) {
    const userWishes = await this.userRepository.find({
      where: { username: username },
      relations: { wishes: true, offers: true },
    });
    return userWishes;
  }

  async findUser(query: FindOneOptions<User>) {
    return await this.userRepository.find(query);
  }
}
