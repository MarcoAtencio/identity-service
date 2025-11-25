import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, IsArray, IsInt, IsOptional } from 'class-validator';

export class CreateRoleDto {
    @ApiProperty({ 
        description: 'El nombre único del rol (ej: ROLE_EDITOR)',
        example: 'ROLE_OPERATOR'
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    name: string;

    @ApiProperty({
        description: 'Lista de IDs de los permisos a asignar al rol',
        example: [1, 2, 5],
        required: false
    })
    @IsArray()
    @IsInt({ each: true })
    @IsOptional()
    permissionIds?: number[];
}
