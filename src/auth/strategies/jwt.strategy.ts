import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET no está definido. La aplicación no puede iniciarse.');
    }

    const strategyOptions: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    };

    super(strategyOptions);
  }

  async validate(payload: { sub: number; email: string; roles: string[]; permissions: string[] }) {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Token inválido.');
    }
    // Devuelve el payload completo, que ahora incluye los permisos
    return { sub: payload.sub, email: payload.email, roles: payload.roles, permissions: payload.permissions };
  }
}