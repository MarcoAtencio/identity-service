// Reemplaza todo el contenido de identity-service/src/auth/auth.controller.ts con esto:

import { Controller, Post, Body, HttpCode, HttpStatus, Res, Get, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { JwtRefreshGuard } from '../common/guards/jwt-refresh.guard';
import { type Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginAuthDto,
    @Res({ passthrough: true }) res: Response, // <-- CAMBIO 1: { passthrough: true }
  ) {
    // El servicio funciona y retorna { accessToken, refreshToken }
    const data = await this.authService.login(loginDto);

    // Ponemos el refresh token en la cookie
    res.cookie('refreshToken', data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'strict',
    });

    // CAMBIO 2: Retornamos el accessToken.
    // NestJS se encargará de enviarlo como JSON
    // y el interceptor lo envolverá en "payload".
    return {
      accessToken: data.accessToken,
    };
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Request() req, @Body() refreshTokenDto: RefreshTokenDto) {
    const userId = req.user.sub;
    const deviceId = refreshTokenDto.deviceId;
    return this.authService.refreshToken(userId, deviceId, req.user.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req, @Body() refreshTokenDto: RefreshTokenDto) {
    const userId = req.user.sub;
    const deviceId = refreshTokenDto.deviceId;
    await this.authService.logout(userId, deviceId);
    return { message: 'Logout exitoso' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    // req.user es el payload del token JWT validado
    return this.authService.getProfile(req.user.sub);
  }
}