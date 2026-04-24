import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'adrien@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Adrien' })
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  displayName!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  @MaxLength(64)
  password!: string;
}
