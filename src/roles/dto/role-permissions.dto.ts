import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, ArrayNotEmpty } from 'class-validator';

export class RolePermissionsDto {
    @ApiProperty({
        description: 'Lista de IDs de los permisos a asignar o desasignar',
        example: [1, 5]
    })
    @IsArray()
    @ArrayNotEmpty()
    @IsInt({ each: true })
    permissionIds: number[];
}
