import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Wish } from 'src/wishes/entities/wish.entity';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Wish)
    private wishRepository: Repository<Wish>,
  ) {}

  async create(createWishlistDto: CreateWishlistDto, userId: number) {
    const { itemsId } = createWishlistDto;
    const user = await this.userRepository.findOneBy({ id: userId });
    const wishes = [];
    try {
      itemsId.forEach(async (itemId) => {
        wishes.push(await this.wishRepository.findOneByOrFail({ id: itemId }));
      });
    } catch {
      throw new NotFoundException('Данные не найдены');
    }
    return this.wishlistRepository.save({
      ...createWishlistDto,
      owner: user,
      items: wishes,
    });
  }

  async findAll() {
    return await this.wishRepository.find();
  }

  async findOneWishlist(id: number) {
    return await this.wishlistRepository.findOne({
      relations: {
        items: true,
        owner: true,
      },
      where: {
        id: id,
      },
    });
  }

  async update(
    id: number,
    updateWishlistDto: UpdateWishlistDto,
    userId: number,
  ) {
    const wishList = await this.wishlistRepository.findOne({
      relations: {
        owner: true,
      },
      where: {
        id: id,
        owner: { id: userId },
      },
    });

    return this.wishlistRepository.update(wishList, {
      ...updateWishlistDto,
    });
  }

  async remove(id: number, userId: number) {
    const wishList = await this.wishlistRepository.findOne({
      relations: {
        owner: true,
      },
      where: {
        id: id,
        owner: {
          id: userId,
        },
      },
    });
    return await this.wishlistRepository.remove(wishList);
  }
}
