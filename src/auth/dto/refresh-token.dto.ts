import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Identificador único del dispositivo del cliente',
    example: 'a8f6a7a5-3a2a-4e7c-9b2a-6a9a7b2a3a4c'
  })
  @IsString()
  @IsNotEmpty()
  deviceId: string;
}