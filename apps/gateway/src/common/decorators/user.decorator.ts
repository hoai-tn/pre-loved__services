import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TokenPayload } from 'apps/auth/src/token-key/token-key.service';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const User = createParamDecorator(
  (data: keyof TokenPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      return undefined;
    }

    return data ? user[data] : user;
  },
);
