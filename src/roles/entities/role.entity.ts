import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Permission } from '../../permissions/entities/permission.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('roles', { schema: 'security' })
export class Role {
  @ApiProperty({ description: 'El ID único del rol.', example: 1, readOnly: true })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'El nombre único del rol.', example: 'admin', required: true })
  @Column({ type: 'varchar', length: 50, nullable: false, unique: true })
  name: string;

  @ApiProperty({ description: 'Indica si el rol está activo.', example: true, default: true })
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Los usuarios que tienen este rol.', type: () => [User] })
  @ManyToMany(() => User, user => user.roles)
  users: User[];

  @ApiProperty({ description: 'Los permisos asociados a este rol.', type: () => [Permission] })
  @ManyToMany(() => Permission, { cascade: true, eager: true })
  @JoinTable({
    name: 'role_permissions',
    schema: 'security',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: Permission[];
}