import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, CreateDateColumn } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users', { schema: 'security' })
export class User {
  @ApiProperty({
    description: 'El ID único del usuario (UUID).',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    readOnly: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'El nombre de usuario único.',
    example: 'johndoe',
    required: true,
  })
  @Column({ type: 'varchar', length: 50, nullable: false, unique: true })
  username: string;

  @ApiProperty({
    description: 'La contraseña del usuario. No se devuelve en las respuestas.',
    example: 'MySecurePassword123',
    writeOnly: true,
  })
  @Column({ type: 'varchar', length: 255, nullable: false })
  password: string;

  @ApiProperty({
    description: 'La dirección de correo electrónico (opcional).',
    example: 'john.doe@example.com',
    required: false,
  })
  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  email: string;

  @ApiProperty({
    description: 'El nombre de pila del usuario.',
    example: 'John',
    required: false,
  })
  @Column({ name: 'first_name', type: 'varchar', length: 100, nullable: true })
  firstName: string;

  @ApiProperty({
    description: 'El apellido del usuario.',
    example: 'Doe',
    required: false,
  })
  @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: true })
  lastName: string;

  @ApiProperty({
    description: 'La fecha y hora de creación del usuario.',
    readOnly: true,
  })
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({
    description: 'Indica si el usuario está activo en el sistema.',
    example: true,
    default: true,
  })
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Los roles asignados al usuario.',
    type: () => [Role],
  })
  @ManyToMany(() => Role, role => role.users, { cascade: ['insert', 'update'], eager: true })
  @JoinTable({
    name: 'user_roles',
    schema: 'security',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  @ApiProperty({
    description: 'Una lista plana de todos los permisos únicos del usuario, derivados de sus roles.',
    example: ['read:users', 'manage:access_control'],
    readOnly: true,
  })
  get permissions(): string[] {
    if (!this.roles) {
        return [];
    }
    const allPermissions = this.roles.flatMap(role => 
        role.permissions ? role.permissions.map(p => p.name) : []
    );
    return [...new Set(allPermissions)];
  }
}