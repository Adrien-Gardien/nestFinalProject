import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class VerifyTwoFactorDto {
  @ApiProperty({ example: 'adrien@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'abc123sessiontoken' })
  @IsString()
  sessionToken!: string;

  @ApiProperty({ example: '654321' })
  @IsString()
  @Length(6, 6)
  code!: string;
}
