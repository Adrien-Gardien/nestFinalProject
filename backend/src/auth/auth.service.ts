import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { randomBytes, randomInt } from 'crypto';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerifyTwoFactorDto } from './dto/verify-2fa.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('Email deja utilisé');
    }

    const passwordHash = await hash(registerDto.password, 10);
    const emailCode = this.generateCode();

    const user = await this.usersService.create({
      email: registerDto.email,
      displayName: registerDto.displayName,
      passwordHash,
      emailVerificationCode: emailCode,
    });

    // Adrien : ça sert en gros à envoyer le code sur SMTP, visible dans Mailpit.
    await this.mailService.sendEmailVerificationCode(user.email, emailCode);

    return {
      message: 'Inscriprion OK, regardez vos mails pour verifier le compte',
      email: user.email,
    };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new BadRequestException('Utilisateur introuvable');
    }

    if (
      !user.emailVerificationCode ||
      user.emailVerificationCode !== dto.code
    ) {
      throw new BadRequestException('Code de verification invalide');
    }

    await this.usersService.markEmailAsVerified(dto.email);

    return {
      message: 'Email verifier, tu peux te co',
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe invalide');
    }

    const isPasswordValid = await compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe invalide');
    }

    if (!user.emailVerified) {
      throw new BadRequestException('il faut  valider ton email avant login');
    }

    const twoFactorCode = this.generateCode();
    const sessionToken = randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Adrien : on garde un token temporaire pour eviter de redonner le mdp.
    await this.usersService.saveTwoFactorCode(
      user.email,
      twoFactorCode,
      sessionToken,
      expiresAt,
    );
    await this.mailService.sendTwoFactorCode(user.email, twoFactorCode);

    return {
      message: 'Code 2FA envoyé par email',
      sessionToken,
      expiresAt,
    };
  }

  async verifyTwoFactor(dto: VerifyTwoFactorDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    if (!user.twoFactorCode || !user.twoFactorSessionToken) {
      throw new UnauthorizedException('Pas de verification 2FA en attente');
    }

    if (user.twoFactorSessionToken !== dto.sessionToken) {
      throw new UnauthorizedException('Session 2FA invalide');
    }

    if (user.twoFactorCode !== dto.code) {
      throw new UnauthorizedException('Code 2FA invalide');
    }

    if (
      !user.twoFactorExpiresAt ||
      user.twoFactorExpiresAt.getTime() < Date.now()
    ) {
      throw new UnauthorizedException('Code 2FA expiré');
    }

    await this.usersService.clearTwoFactorData(user.email);

    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      {
        secret: process.env.JWT_SECRET ?? 'dev-secret',
        expiresIn: '1h',
      },
    );

    return {
      message: 'Connexion validée',
      accessToken,
      user: this.usersService.toPublicProfile(user),
    };
  }

  private generateCode(): string {
    return randomInt(100000, 999999).toString();
  }
}
