import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Wish } from './entities/wish.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private wishRepository: Repository<Wish>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createWishDto: CreateWishDto, id: number) {
    const user = await this.userRepository.findOneBy({ id: id });
    return await this.wishRepository.save({
      ...createWishDto,
      owner: user,
    });
  }

  async findLastWish() {
    return await this.wishRepository.find({
      relations: { owner: true },
      order: {
        createdAt: 'DESC',
      },
      take: 30,
    });
  }

  async findTopWish() {
    return await this.wishRepository.find({
      relations: { owner: true, offers: true },
      order: {
        copied: 'DESC',
      },
      take: 10,
    });
  }

  async findOne(id: number) {
    const wish = await this.wishRepository.findOne({
      relations: {
        offers: true,
        owner: true,
      },
      where: { id: id },
    });
    return wish;
  }

  async findOneWish(query: FindOneOptions<Wish>) {
    return await this.wishRepository.findOneOrFail(query);
  }

  async update(id: number, updateWishDto: UpdateWishDto, userId: number) {
    const { price } = updateWishDto;
    const wish = await this.wishRepository.findOne({
      where: { id: id },
      relations: ['owner'],
    });
    if (wish.owner.id !== userId) {
      throw new ForbiddenException('Вы не можете редактировать чужие  подарки');
    }
    if (wish.raised > 0 && price) {
      throw new ConflictException('Сбор средств уже идет');
    }
    return this.wishRepository.save({ ...wish, ...updateWishDto });
  }

  async copy(wishId: number, userId: number) {
    const wish = await this.wishRepository.findOneBy({ id: wishId });
    const owner = await this.userRepository.findOne({
      relations: {
        wishes: true,
      },
      where: {
        id: userId,
      },
    });
    const { copied, ...wishData } = wish;
    wish.copied = copied + 1;
    await this.wishRepository.save(wish);
    return this.wishRepository.create({ ...wishData, owner: owner });
  }

  async remove(wishId: number, userId: number) {
    const wish = await this.wishRepository.findOne({
      relations: {
        owner: true,
      },
      where: {
        id: wishId,
      },
    });
    if (wish.owner.id !== userId) {
      throw new ForbiddenException('Нельзя удалять чужие подарки');
    }
    return this.wishRepository.remove(wish);
  }
}
