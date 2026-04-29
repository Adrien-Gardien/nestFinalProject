import { Body, Controller, Get, Post, UseInterceptors } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import {
  LoginResponseDto,
  PublicUserProfileDto,
  RegisterResponseDto,
  VerifyEmailResponseDto,
  VerifyTwoFactorResponseDto,
} from './dto/auth-responses.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerifyTwoFactorDto } from './dto/verify-2fa.dto';
import { LoginLoggingInterceptor } from './interceptors/login-logging.interceptor';

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
  @ApiCreatedResponse({ type: RegisterResponseDto })
  @ApiBadRequestResponse({
    description: 'Email déjà utilisé ou données invalides',
  })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('verify-email')
  @ApiOperation({ summary: 'Valider le compte avec le code reçu par email' })
  @ApiOkResponse({ type: VerifyEmailResponseDto })
  @ApiBadRequestResponse({
    description: 'Utilisateur introuvable ou code invalide',
  })
  verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Public()
  @Post('login')
  @UseInterceptors(LoginLoggingInterceptor)
  @ApiOperation({ summary: 'Login étape 1 (email + mot de passe)' })
  @ApiOkResponse({
    type: LoginResponseDto,
    description: "Retourne un sessionToken pour l'étape 2FA",
  })
  @ApiUnauthorizedResponse({ description: 'Email ou mot de passe invalide' })
  @ApiBadRequestResponse({ description: 'Email non vérifié' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('verify-2fa')
  @ApiOperation({ summary: 'Login étape 2 (code 2FA email + sessionToken)' })
  @ApiOkResponse({
    type: VerifyTwoFactorResponseDto,
    description: "Retourne le JWT d'accès",
  })
  @ApiUnauthorizedResponse({
    description: 'Code 2FA invalide, expiré ou session invalide',
  })
  verifyTwoFactor(@Body() verifyTwoFactorDto: VerifyTwoFactorDto) {
    return this.authService.verifyTwoFactor(verifyTwoFactorDto);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer mon profil connecté' })
  @ApiOkResponse({ type: PublicUserProfileDto })
  @ApiUnauthorizedResponse({ description: 'Token manquant ou invalide' })
  me(@CurrentUser() user: AuthUser) {
    return this.usersService.getPublicProfile(user.id);
  }
}
