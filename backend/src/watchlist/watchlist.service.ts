import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWatchlistItemDto } from './dto/create-watchlist-item.dto';
import { UpdateWatchlistItemDto } from './dto/update-watchlist-item.dto';
import { WatchlistItemEntity } from './entities/watchlist-item.entity';
import { WatchlistStatsEntity } from './entities/watchlist-stats.entity';

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

  async updateForUser(
    userId: string,
    itemId: string,
    dto: UpdateWatchlistItemDto,
  ): Promise<WatchlistItemEntity> {
    await this.ensureOwnership(userId, itemId);

    return this.prismaService.watchlistItem.update({
      where: { id: itemId },
      data: {
        watched: dto.watched,
        watchedAt: dto.watched ? new Date() : null,
      },
    });
  }

  async removeForUser(userId: string, itemId: string): Promise<void> {
    await this.ensureOwnership(userId, itemId);

    await this.prismaService.watchlistItem.delete({
      where: { id: itemId },
    });
  }

  async getStatsForUser(userId: string): Promise<WatchlistStatsEntity> {
    const items = await this.prismaService.watchlistItem.findMany({
      where: { userId },
      select: { watched: true, year: true },
    });

    const total = items.length;
    const watched = items.filter((item) => item.watched).length;

    const countsByYear = new Map<number, number>();
    for (const item of items) {
      if (!item.watched) continue;
      countsByYear.set(item.year, (countsByYear.get(item.year) ?? 0) + 1);
    }

    let mostWatchedYear: number | null = null;
    let maxCount = 0;
    for (const [year, count] of countsByYear) {
      if (count > maxCount) {
        mostWatchedYear = year;
        maxCount = count;
      }
    }

    return {
      total,
      watched,
      unwatched: total - watched,
      mostWatchedYear,
    };
  }

  getAllForAdmin(): Promise<WatchlistItemEntity[]> {
    return this.prismaService.watchlistItem.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  private async ensureOwnership(userId: string, itemId: string): Promise<void> {
    const item = await this.prismaService.watchlistItem.findUnique({
      where: { id: itemId },
      select: { userId: true },
    });

    if (!item) {
      throw new NotFoundException('Film introuvable dans la watchlist');
    }

    if (item.userId !== userId) {
      throw new ForbiddenException("Ce film n'est pas dans ta watchlist");
    }
  }
}
