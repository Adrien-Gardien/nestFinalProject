import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateWatchlistItemDto {
  @ApiProperty({ example: true, description: 'Marque le film comme vu ou non' })
  @IsBoolean()
  watched!: boolean;
}
