import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateWatchlistItemDto {
  @ApiProperty({ example: 'Dune: Part Two' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title!: string;

  @ApiProperty({ example: 2024 })
  @IsInt()
  @Min(1900)
  @Max(2100)
  year!: number;
}
