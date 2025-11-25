import { Injectable, Inject, BadRequestException, UnauthorizedException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { REDIS_CLIENT } from '../common/redis/redis.provider';
import Redis from 'ioredis';
import { LoginAuthDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async login(loginDto: LoginAuthDto) {
        console.log('[AuthService] Login attempt with:', loginDto.email);
        try {
            const { email, password, deviceId } = loginDto;
            const user = await this.usersService.findOneByEmail(email);
            console.log('[AuthService] User found:', !!user);

            if (!user || !(await bcrypt.compare(password, user.password))) {
                console.log('[AuthService] Invalid credentials for user:', email);
                throw new UnauthorizedException('Credenciales inválidas');
            }

            console.log('[AuthService] Credentials valid, generating tokens for user:', email);

            const accessTokenPayload = { 
                sub: user.id, 
                email: user.email, 
                roles: user.roles.map(r => r.name),
                permissions: user.permissions // Usamos el getter de la entidad User
            };
            const refreshTokenPayload = { sub: user.id, deviceId };

            const accessToken = this.jwtService.sign(accessTokenPayload, {
                expiresIn: `${this.configService.get('JWT_EXPIRATION_MS')}ms`
            });
            const refreshToken = this.jwtService.sign(refreshTokenPayload, {
                secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
                expiresIn: `${this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_MS')}ms`,
            });

            console.log('[AuthService] Tokens generated, saving refresh token to Redis...');
            const redisKey = `user:${user.id}:sessions`;
            await this.redisClient.hset(redisKey, deviceId, refreshToken);
            console.log('[AuthService] Refresh token saved to Redis.');

            return {
                accessToken, 
                refreshToken, 
            };
        } catch (error) {
            console.error('[AuthService] Error during login:', error);
            throw error; // Re-throw the original error
        }
    }

    async refreshToken(userId: string, deviceId: string, providedRefreshToken: string) {
        const redisKey = `user:${userId}:sessions`;
        const storedRefreshToken = await this.redisClient.hget(redisKey, deviceId);

        if (!storedRefreshToken || providedRefreshToken !== storedRefreshToken) {
            throw new UnauthorizedException('Sesión no encontrada o token de refresco inválido.');
        }

        const user = await this.usersService.findOne(userId);
        if (!user) {
            throw new UnauthorizedException('Usuario no encontrado.');
        }

        // Generar nuevos tokens
        const accessTokenPayload = { 
            sub: user.id, 
            email: user.email, 
            roles: user.roles.map(r => r.name),
            permissions: user.permissions
        };
        const refreshTokenPayload = { sub: user.id, deviceId };

        const accessToken = this.jwtService.sign(accessTokenPayload, {
            expiresIn: `${this.configService.get('JWT_EXPIRATION_MS')}ms`
        });
        const newRefreshToken = this.jwtService.sign(refreshTokenPayload, {
            secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
            expiresIn: `${this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_MS')}ms`,
        });

        // Actualizar el refresh token en Redis para este dispositivo
        await this.redisClient.hset(redisKey, deviceId, newRefreshToken);

        return { accessToken, refreshToken: newRefreshToken };
    }

    async logout(userId: string, deviceId: string) {
        const redisKey = `user:${userId}:sessions`;
        await this.redisClient.hdel(redisKey, deviceId);
        return { message: 'Sesión cerrada exitosamente.' };
    }

    async logoutAll(userId: string) {
        const redisKey = `user:${userId}:sessions`;
        await this.redisClient.del(redisKey);
        return { message: 'Todas las sesiones han sido cerradas.' };
    }

    async getProfile(userEmail: string) {
        const user = await this.usersService.findOneByEmail(userEmail);
        if (!user) {
            throw new NotFoundException(`Usuario con email ${userEmail} no encontrado.`);
        }
        const { password, ...userProfile } = user;
        return userProfile;
    }
}