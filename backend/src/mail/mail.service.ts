import { Injectable, Logger } from '@nestjs/common';
import nodemailer, { type Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter;
  private readonly fromAddress: string;

  constructor() {
    this.fromAddress = process.env.MAIL_FROM ?? 'no-reply@watchlist.dev';
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST ?? 'localhost',
      port: Number(process.env.MAIL_PORT ?? 1025),
      secure: false,
    });
  }

  async sendEmailVerificationCode(to: string, code: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.fromAddress,
      to,
      subject: 'Code verification inscription',
      text: `Ton code de verification est: ${code}`,
      html: `<p>Ton code de verification est: <b>${code}</b></p>`,
    });

    this.logger.log(`Mail verification envoyé à ${to}`);
  }

  async sendTwoFactorCode(to: string, code: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.fromAddress,
      to,
      subject: 'Code de connexion 2FA',
      text: `Ton code de connexion est: ${code}`,
      html: `<p>Ton code de connexion est: <b>${code}</b></p>`,
    });

    this.logger.log(`Mail 2FA envoyé à ${to}`);
  }
}
