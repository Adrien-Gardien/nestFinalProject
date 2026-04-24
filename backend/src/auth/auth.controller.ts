import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerifyTwoFactorDto } from './dto/verify-2fa.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Créer un compte + envoi code de validation email' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('verify-email')
  @ApiOperation({ summary: 'Valider le compte avec le code reçu par email' })
  verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login étape 1 (email + mot de passe)' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('verify-2fa')
  @ApiOperation({ summary: 'Login étape 2 (code 2FA email + sessionToken)' })
  verifyTwoFactor(@Body() verifyTwoFactorDto: VerifyTwoFactorDto) {
    return this.authService.verifyTwoFactor(verifyTwoFactorDto);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer mon profil connecté' })
  me(@CurrentUser() user: AuthUser) {
    return this.usersService.getPublicProfile(user.id);
  }
}
