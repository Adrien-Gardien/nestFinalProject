import { ApiProperty } from '@nestjs/swagger';

export class PublicUserProfileDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'adrien@example.com' })
  email: string;

  @ApiProperty({ example: 'Adrien' })
  displayName: string;

  @ApiProperty({ example: 'USER', enum: ['USER', 'ADMIN'] })
  role: string;

  @ApiProperty({ example: true })
  emailVerified: boolean;
}

export class RegisterResponseDto {
  @ApiProperty({ example: 'Inscriprion OK, regardez vos mails pour verifier le compte' })
  message: string;

  @ApiProperty({ example: 'adrien@example.com' })
  email: string;
}

export class VerifyEmailResponseDto {
  @ApiProperty({ example: 'Email verifier, tu peux te co' })
  message: string;
}

export class LoginResponseDto {
  @ApiProperty({ example: 'Code 2FA envoyé par email' })
  message: string;

  @ApiProperty({ example: 'a3f8b2c1d4e5f6789012abcdef345678901234567890abcdef' })
  sessionToken: string;

  @ApiProperty({ example: '2024-01-01T00:10:00.000Z' })
  expiresAt: Date;
}

export class VerifyTwoFactorResponseDto {
  @ApiProperty({ example: 'Connexion validée' })
  message: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ type: PublicUserProfileDto })
  user: PublicUserProfileDto;
}
