import { Injectable, OnModuleInit } from '@nestjs/common';
import { hash } from 'bcryptjs';
import {
  PublicUserProfile,
  UserEntity,
  UserRole,
} from './entities/user.entity';
import { PrismaService } from '../prisma/prisma.service';

interface CreateUserInput {
  email: string;
  displayName: string;
  passwordHash: string;
  role?: UserRole;
  emailVerificationCode: string;
}

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(private readonly prismaService: PrismaService) {}

  async onModuleInit(): Promise<void> {
    await this.seedAdminUser();
  }

  findByEmail(email: string): Promise<UserEntity | null> {
    return this.prismaService.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });
  }

  findById(id: string): Promise<UserEntity | null> {
    return this.prismaService.user.findUnique({
      where: { id },
    });
  }

  async create(input: CreateUserInput): Promise<UserEntity> {
    return this.prismaService.user.create({
      data: {
        email: input.email.toLowerCase(),
        displayName: input.displayName,
        passwordHash: input.passwordHash,
        role: input.role ?? UserRole.USER,
        emailVerified: false,
        emailVerificationCode: input.emailVerificationCode,
        twoFactorCode: null,
        twoFactorExpiresAt: null,
        twoFactorSessionToken: null,
      },
    });
  }

  async markEmailAsVerified(email: string): Promise<void> {
    await this.prismaService.user.updateMany({
      where: { email: email.toLowerCase() },
      data: {
        emailVerified: true,
        emailVerificationCode: null,
      },
    });
  }

  async saveTwoFactorCode(
    email: string,
    code: string,
    sessionToken: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.prismaService.user.updateMany({
      where: { email: email.toLowerCase() },
      data: {
        twoFactorCode: code,
        twoFactorSessionToken: sessionToken,
        twoFactorExpiresAt: expiresAt,
      },
    });
  }

  async clearTwoFactorData(email: string): Promise<void> {
    await this.prismaService.user.updateMany({
      where: { email: email.toLowerCase() },
      data: {
        twoFactorCode: null,
        twoFactorSessionToken: null,
        twoFactorExpiresAt: null,
      },
    });
  }

  async setNewEmailVerificationCode(
    email: string,
    code: string,
  ): Promise<void> {
    await this.prismaService.user.updateMany({
      where: { email: email.toLowerCase() },
      data: {
        emailVerificationCode: code,
      },
    });
  }

  async getPublicProfile(userId: string): Promise<PublicUserProfile | null> {
    const user = await this.findById(userId);
    if (!user) {
      return null;
    }

    return this.toPublicProfile(user);
  }

  toPublicProfile(user: UserEntity): PublicUserProfile {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      emailVerified: user.emailVerified,
    };
  }

  private async seedAdminUser(): Promise<void> {
    const adminEmail = 'admin@watchlist.dev';
    const existingAdmin = await this.findByEmail(adminEmail);
    if (existingAdmin) {
      return;
    }

    const passwordHash = await hash('admin123', 10);
    await this.prismaService.user.create({
      data: {
        email: adminEmail,
        displayName: 'Admin',
        passwordHash,
        role: UserRole.ADMIN,
        emailVerified: true,
        emailVerificationCode: null,
        twoFactorCode: null,
        twoFactorExpiresAt: null,
        twoFactorSessionToken: null,
      },
    });
  }
}
