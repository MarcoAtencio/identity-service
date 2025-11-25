import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, MinLength, MaxLength, Matches, IsOptional, IsArray, IsNotEmpty, IsBoolean } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({
        description: 'El nombre de usuario único.',
        example: 'johndoe',
    })
    @IsString()
    @IsNotEmpty({ message: 'El nombre de usuario no puede estar vacío.' })
    @MinLength(3)
    @MaxLength(50)
    username: string;

    @ApiProperty({ 
        description: 'La contraseña del usuario. Debe contener mayúsculas, minúsculas, números y caracteres especiales.',
        example: 'Password123!',
    })
    @IsString()
    @IsNotEmpty({ message: 'La contraseña no puede estar vacía.' })
    @MinLength(8)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/, {
        message: 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial.',
    })
    password: string;

    @ApiProperty({ 
        description: 'El email del usuario (opcional).',
        example: 'user@example.com',
        required: false,
    })
    @IsOptional()
    @IsEmail({}, { message: 'El formato del email no es válido.' })
    email?: string;

    @ApiProperty({
        description: 'El nombre de pila del usuario.',
        example: 'John',
        required: false,
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    firstName?: string;

    @ApiProperty({
        description: 'El apellido del usuario.',
        example: 'Doe',
        required: false,
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    lastName?: string;

    @ApiProperty({
        description: 'Indica si el usuario está activo. Por defecto es true.',
        example: true,
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiProperty({
        description: 'Lista de nombres de roles a asignar al usuario.',
        example: ['ROLE_ADMIN'],
        required: false,
        type: [String]
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    roles?: string[];
}