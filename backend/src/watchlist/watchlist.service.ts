import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWatchlistItemDto } from './dto/create-watchlist-item.dto';
import { WatchlistItemEntity } from './entities/watchlist-item.entity';

@Injectable()
export class WatchlistService {
  constructor(private readonly prismaService: PrismaService) {}

  getForUser(userId: string): Promise<WatchlistItemEntity[]> {
    return this.prismaService.watchlistItem.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  addForUser(
    userId: string,
    dto: CreateWatchlistItemDto,
  ): Promise<WatchlistItemEntity> {
    // Adrien : ici on ajoute dans postgres, ca survive au restart.
    return this.prismaService.watchlistItem.create({
      data: {
        userId,
        title: dto.title,
        year: dto.year,
      },
    });
  }

  getAllForAdmin(): Promise<WatchlistItemEntity[]> {
    return this.prismaService.watchlistItem.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
