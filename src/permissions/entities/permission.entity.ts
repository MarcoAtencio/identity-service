import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('permissions', { schema: 'security' })
export class Permission {
  @ApiProperty({ description: 'El ID único del permiso.', example: 1, readOnly: true })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'El nombre único del permiso.', example: 'manage:access_control', required: true })
  @Column({ type: 'varchar', length: 100, nullable: false, unique: true })
  name: string;

  @ApiProperty({ description: 'Indica si el permiso está activo.', example: true, default: true })
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}