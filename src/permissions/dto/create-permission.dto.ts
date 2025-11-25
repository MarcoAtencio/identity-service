import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreatePermissionDto {
    @ApiProperty({ 
        description: 'El nombre único del permiso (ej: create:user)',
        example: 'read:products'
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    name: string;
}
