import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private readonly configService: ConfigService) {
    const secret = configService.get<string>('JWT_REFRESH_TOKEN_SECRET');
    if (!secret) {
      throw new Error('JWT_REFRESH_TOKEN_SECRET no está definido. La aplicación no puede iniciarse.');
    }

    const strategyOptions: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true,
    };

    super(strategyOptions);
  }

  validate(req: Request, payload: { sub: string, deviceId: string }) {
    const authorization = req.get('authorization');
    if (!authorization) {
      throw new UnauthorizedException('El token de refresco no fue proporcionado.');
    }

    if (!payload.sub || !payload.deviceId) {
      throw new UnauthorizedException('Token de refresco inválido.');
    }

    const refreshToken = authorization.replace('Bearer', '').trim();
    return { userId: payload.sub, deviceId: payload.deviceId, refreshToken };
  }
}