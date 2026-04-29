import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, tap, throwError } from 'rxjs';

type LoginRequest = {
  body?: unknown;
};

@Injectable()
export class LoginLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoginLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startedAt = Date.now();
    const request = context.switchToHttp().getRequest<LoginRequest>();
    const email = this.extractEmail(request);

    return next.handle().pipe(
      tap(() => {
        this.logger.log(
          `Login reussi pour ${email} en ${Date.now() - startedAt}ms`,
        );
      }),
      catchError((error: unknown) => {
        this.logger.warn(
          `Login echoue pour ${email} en ${Date.now() - startedAt}ms`,
        );
        return throwError(() => error);
      }),
    );
  }

  private extractEmail(request: LoginRequest): string {
    const body = request.body;

    if (!body || typeof body !== 'object' || !('email' in body)) {
      return 'email inconnu';
    }

    const email = body.email;

    if (typeof email === 'string' && email.trim() !== '') {
      return email.trim().toLowerCase();
    }

    return 'email inconnu';
  }
}
