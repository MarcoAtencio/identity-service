import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class LoginAuthDto {
    @ApiProperty({ 
        description: 'El email del usuario',
        example: 'user@example.com' 
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ 
        description: 'La contraseña del usuario',
        example: 'Password123!' 
    })
    @IsString()
    @IsNotEmpty()
    password: string;

    @ApiProperty({
        description: 'Identificador único del dispositivo del cliente',
        example: 'a8f6a7a5-3a2a-4e7c-9b2a-6a9a7b2a3a4c'
    })
    @IsString()
    @IsNotEmpty()
    deviceId: string;
}