import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    } satisfies StrategyOptionsWithRequest);
  }

  async validate(req: Request, payload: JwtPayload) {
    console.log('RefreshTokenStrategy validate called with payload:', payload);

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('Authorization header missing');
      throw new UnauthorizedException('Refresh token missing');
    }

    const refreshToken = authHeader.replace('Bearer ', '').trim();
    if (!refreshToken) {
      console.error('Refresh token missing in authorization header');
      throw new UnauthorizedException(
        'Refresh token is empty after extraction',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, refreshToken: true },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException(
        'User not found or refresh token missing',
      );
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Refresh token is invalid');
    }

    return { id: user.id, email: user.email, role: user.role };
  }
}
