import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolePermissionsDto } from './dto/role-permissions.dto';
import { PermissionsService } from '../permissions/permissions.service';

@Injectable()
export class RolesService {
    constructor(
        @InjectRepository(Role) private roleRepository: Repository<Role>,
        private permissionsService: PermissionsService,
    ) {}

    async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
        const newRole = this.roleRepository.create({ ...createRoleDto, isActive: true });
        return this.roleRepository.save(newRole);
    }

    async findAllRoles(): Promise<Role[]> {
        return this.roleRepository.find({ where: { isActive: true }, relations: ['permissions'] });
    }

    async findOneRole(id: number): Promise<Role> {
        const role = await this.roleRepository.findOne({ where: { id }, relations: ['permissions'] });
        if (!role) {
            throw new NotFoundException(`Rol con ID "${id}" no encontrado.`);
        }
        return role;
    }

    async updateRole(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
        const role = await this.findOneRole(id);
        this.roleRepository.merge(role, updateRoleDto);
        return this.roleRepository.save(role);
    }

    async removeRole(id: number): Promise<void> {
        const role = await this.findOneRole(id);
        role.isActive = false;
        await this.roleRepository.save(role);
    }

    async enableRole(id: number): Promise<void> {
        const role = await this.findOneRole(id);
        role.isActive = true;
        await this.roleRepository.save(role);
    }

    async findOneRoleByName(name: string): Promise<Role | null> {
        return this.roleRepository.findOne({ where: { name }, relations: ['permissions'] });
    }

    async assignPermissionsToRole(roleId: number, rolePermissionsDto: RolePermissionsDto): Promise<Role> {
        const { permissionIds } = rolePermissionsDto;
        const role = await this.findOneRole(roleId);

        const permissions = await this.permissionsService.findPermissionsByIds(permissionIds);
        if (permissions.length !== permissionIds.length) {
            throw new BadRequestException('Uno o más IDs de permisos no son válidos o los permisos están inactivos.');
        }

        const currentPermissionIds = new Set(role.permissions.map(p => p.id));
        const newPermissions = permissions.filter(p => !currentPermissionIds.has(p.id));

        role.permissions = [...role.permissions, ...newPermissions];
        return this.roleRepository.save(role);
    }

    async unassignPermissionsFromRole(roleId: number, rolePermissionsDto: RolePermissionsDto): Promise<Role> {
        const { permissionIds } = rolePermissionsDto;
        const role = await this.findOneRole(roleId);

        role.permissions = role.permissions.filter(p => !permissionIds.includes(p.id));

        return this.roleRepository.save(role);
    }
}